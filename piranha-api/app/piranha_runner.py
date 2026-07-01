import asyncio
import aiofiles
import subprocess
from collections.abc import AsyncGenerator
from pathlib import Path

class PiranhaRunner:
    def __init__(self, piranha_env_path: Path):
        self.piranha_env_path = piranha_env_path
        self.piranha_activate_path = Path(piranha_env_path / "activate")
        self.piranha_env = self.get_piranha_env()

    def get_piranha_env(self):
         # TODO: nicer version of this?
         """Get the environment with /venv activated"""
         result = subprocess.run(["/bin/bash", "-c", f"source {self.piranha_activate_path} && env"], capture_output=True, text=True)
         print("called subproc")
         print("env is")
         print(result)
         # Parse the env output into a dict
         env_dict = {}
         for line in result.stdout.split("\n"):
             if "=" in line:
                 key, value = line.split("=", 1)
                 env_dict[key] = value
         return env_dict

    #def log_line(run_id: str, line: str):

    #def log_lines(run_id: str, lines: str):

    async def run_piranha_log_generator(
         self,
         run_id: str, run_name: str, barcodes_file_path: str, minknow_dir_path: str, output_dir_path: str
    ) -> AsyncGenerator[str, None]:
         start_line = f"Starting run {run_name} with run id {run_id}"
         yield start_line
         print(start_line)

         # TODO: revert notempt and verbose
         # piranha_cmd = f"source /venv/bin/activate && piranha -b {barcodes_file_path} -i {minknow_dir_path} -o {output_dir_path} -t 10 --verbose --no-temp"
         # TODO: Is /tmp best place for logfiles? Could put it in requests_data/output, and then they'd be saved if ever needed. Actually,
         # let's write this to output and include it in the download zip!

         # We need to write to a log file because mafft (called fron piranha) assumes that the default stdout is available, and errors if it's being piped through the
         # subprocess. So we do not set stdout or stderr on the process, but instead send all output to a log file which we poll and stream
         # to the response. This has a nice consequence that we're naturally saving the logs to file, which we can include in the download
         # zip of the run - it may be useful.
         log_path = Path(f"/tmp/subprocess_{run_id}.log")
         piranha_cmd = f"source {self.piranha_activate_path} && piranha -b {barcodes_file_path} -i {minknow_dir_path} -o {output_dir_path} -t 10 > {log_path} 2>&1"
         # cmd = ["/bin/bash", "-lc", piranha_cmd]
         # bash_wrap_cmd = f"bash -i -c '{piranha_cmd}'"

         print("command is")
         print(piranha_cmd)
         try:
             # start non-blocking process
             # process = await asyncio.create_subprocess_exec(
             process = await asyncio.create_subprocess_shell(piranha_cmd, env=self.piranha_env, executable="/bin/bash")

             # Wait for the log file to be created
             POLL_WAIT = 0.2
             remaining_wait = 5
             while not log_path.exists() and remaining_wait > 0:
                 await asyncio.sleep(POLL_WAIT)
                 remaining_wait -= POLL_WAIT

             # While process is running, poll logfile for new content
             async with aiofiles.open(log_path, "r") as f:
                 while process.returncode is None:
                     new_content = await f.read()
                     if new_content:
                         yield new_content
                         print(new_content)  # TODO: util to print and yield with run_id
                     await asyncio.sleep(POLL_WAIT)

                 # Read any remaining content after process finishes
                 await process.wait()
                 remaining_content = await f.read()
                 if remaining_content:
                     yield remaining_content
                     print(remaining_content)

             # Final status message
             final_msg = f"Piranha run completed with exit code {process.returncode}\n"
             yield final_msg
             print(final_msg)

         except Exception as e:
             # TODO: how should we return error status in the case of piranha run error? Request has already gone at this point...
             # Error if don't have expected final line? Or make /status endpoint available?
             error_msg = f"\n[ERROR] Exception encountered during execution: {str(e)}\n"
             yield error_msg
             print(error_msg)

         final_line = f"{run_id} Finished run"
         yield final_line
         print(final_line)