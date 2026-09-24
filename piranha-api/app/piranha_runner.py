import asyncio
from collections.abc import AsyncGenerator
from pathlib import Path

import aiofiles

from app.models import PiranhaRunOptions

POLL_WAIT = 0.2


def safe_option(name: str, value: str):
    if len(value.strip()) == 0:
        return ""
    else:
        value = value.replace(" ", "_")
    return f"{name} {value}"


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

    async def run_piranha_log_generator(
        self,
        run_id: str,
        run_options: PiranhaRunOptions,
        barcodes_file_path: str,
        minknow_dir_path: str,
        output_dir_path: str,
    ) -> AsyncGenerator[str, None]:
        yield self.log_line(run_id, f"Starting run {run_options.run_name} with run id {run_id}")

        # We need to write to a log file because mafft (called fron piranha) assumes that the default stdout is
        # available, and errors if it's being piped through the subprocess. So we do not set stdout or stderr on the
        # process, but instead send all output to a log file which we poll and stream to the response. This has a nice
        # consequence that we're naturally saving the logs to file, which we can include in the download
        # zip of the run as it may be of use.
        log_path = Path(output_dir_path) / "piranha.log"

        option_vals = [
            f"-b {barcodes_file_path}",
            f"-i {minknow_dir_path}",
            f"-o {output_dir_path}",
            # run parameters
            f"--threads {run_options.threads}",
            safe_option("--runname", run_options.run_name),
            safe_option("--notes", run_options.notes),
            # run settings
            f"--sample-type {run_options.protocol.value}",
            safe_option("--positive-control", run_options.positive_control),
            safe_option("--negative-control", run_options.negative_control),
            # piranha output settings
            f"--orientation {run_options.orientation.value}",
            safe_option("--output-prefix", run_options.output_prefix),
            f"{'--all-metadata-to-header' if run_options.all_metadata_to_header else ''}",
            f"{'--no-temp' if run_options.output_intermediate_files else ''}",
            # user settings
            safe_option("--username", run_options.user_name),
            safe_option("--institute", run_options.institute),
            f"--language {run_options.lang.value}",
            "--medaka-model AUTO",
            # this option ensures piranha writes to our run_id output dir, not a new dir with _1 appended
            "--overwrite ",
        ]

        options_string = " ".join(option_vals)
        piranha_cmd = f"source {self.piranha_activate_path} && piranha {options_string} > {log_path} 2>&1"

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
