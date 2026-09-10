import asyncio
import tempfile
from collections.abc import AsyncGenerator
from pathlib import Path
from app.models import PiranhaRunOptions

import aiofiles

POLL_WAIT = 0.2


class PiranhaRunner:
    def __init__(self, piranha_venv_path: Path):
        self.piranha_venv_path = piranha_venv_path
        self.piranha_activate_path = Path(piranha_venv_path / "activate")

    async def wait_for_log_file(self, log_path: Path):
        # Wait for the log file to be created
        remaining_wait = 5
        while not log_path.exists() and remaining_wait > 0:
            await asyncio.sleep(POLL_WAIT)
            remaining_wait -= POLL_WAIT

    def log_line(self, run_id: str, line: str):
        print(f"{run_id} {line}")
        return line

    def log_lines(self, run_id: str, lines: str):
        for line in lines.split("\n"):
            yield self.log_line(run_id, line)

    def get_config_line(name, value):
        return f'{name}: "{value}"'

    def write_options_to_config_file(
        self,
        run_options: PiranhaRunOptions,
        barcodes_file_path: str,
        minknow_dir_path: str,
        output_dir_path: str
    ):
        with tempfile.NamedTemporaryFile(
                mode="w+t",
                suffix=".yaml",
                delete=False
            ) as config_file:
                lines = [
                    get_config_line("barcodes_csv", barcodes_file_path),
                    get_config_line("readdir", minknow_dir_path),
                    get_config_line("outdir", output_dir_path),
                    get_config_line("runname", run_options.run_name),
                    get_config_line("notes", run_options.notes),
                    get_config_line("threads", str(run_options.threads)),
                    get_config_line("sample_type", run_options.protocol),
                    get_config_line("positive_control", run_options.positive_control),
                    get_config_line("negative_control", run_options.negative_control),
                    get_config_line("orientation", run_options.orientation),
                    get_config_line("output_prefix", run_options.output_prefix),
                    get_config_line("all_metadata_to_header", str(run_options.all_metadata_to_header)),
                    get_config_line("username", run_options.user_name),
                    get_config_line("institute", run_options.institute),
                    get_config_line("language", run_options.lang),
                    #  this option ensures piranha write to our run_id output dir, not a new dir with _1 appended
                    get_config_line("overwrite", "True")
                ]
                config_file.writelines(lines)
                return config_file.name

    async def run_piranha_log_generator(
        self,
        run_id: str,
        run_options: PiranhaRunOptions,
        barcodes_file_path: str,
        minknow_dir_path: str,
        output_dir_path: str
    ) -> AsyncGenerator[str, None]:
        yield self.log_line(run_id, f"Starting run {run_options.run_name} with run id {run_id}")


        # We need to write to a log file because mafft (called fron piranha) assumes that the default stdout is
        # available, and errors if it's being piped through the subprocess. So we do not set stdout or stderr on the
        # process, but instead send all output to a log file which we poll and stream to the response. This has a nice
        # consequence that we're naturally saving the logs to file, which we can include in the download
        # zip of the run as it may be of use.
        log_path = Path(output_dir_path) / "piranha.log"

        config_file_path = self.write_options_to_config_file(run_options, barcodes_file_path, minknow_dir_path, output_dir_path)
        piranha_cmd = (
            f"source {self.piranha_activate_path} && "
            f"piranha -c {config_file_path} "
            f"> {log_path} 2>&1"
        )

        try:
            # start non-blocking process
            process = await asyncio.create_subprocess_shell(piranha_cmd, executable="/bin/bash")

            await self.wait_for_log_file(log_path)

            # While process is running, poll logfile for new content
            async with aiofiles.open(log_path) as f:
                while process.returncode is None:
                    new_content = await f.read()
                    if new_content:
                        for line in self.log_lines(run_id, new_content):
                            yield line
                    await asyncio.sleep(POLL_WAIT)

                # Read any remaining content after process finishes
                await process.wait()
                remaining_content = await f.read()
                if remaining_content:
                    for line in self.log_lines(run_id, remaining_content):
                        yield line

            # Final status message
            yield self.log_line(run_id, f"Piranha run completed with exit code {process.returncode}")

        except Exception as e:
            # TODO: Provide a way for client to more clearly know about execution error (can't set response status here
            # after start streaming). Save error to output folder, and provide /results-status response
            yield self.log_line(run_id, f"[ERROR] Exception encountered during execution: {e!s}")
        finally:
            if os.path.exists(config_file_path):
                os.remove(config_file_path)



