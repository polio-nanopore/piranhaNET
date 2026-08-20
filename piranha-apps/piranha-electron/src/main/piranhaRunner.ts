import type { PiranhaRunOptions } from "../../../svelte-app/src/shared/types";
import Docker, {Container} from "dockerode";
import { userInfo } from "node:os";

// Class for pulling piranha docker image and using it to run piranha jobs, used by Electron main process
export class PiranhaRunner {
  private readonly imageRef: string;
  private readonly isWindows: boolean;
  private readonly userName: string;
  private readonly userMapping: string | undefined;
  private docker = new Docker();
  constructor(imageName, imageTag) {
    this.imageRef = `${imageName}:${imageTag}`;
    const { username, uid, gid } = userInfo();
    this.userName = username;
    // We use the current user's id (uid) and group id (gid) to run docker on non-Windows OSes as otherwise it runs as
    // root and causes file permission problems
    this.isWindows = process.platform === "win32";
    this.userMapping =
      !this.isWindows && uid !== -1 ? `${uid}:${gid}` : undefined;
  }

  get osIsWindows(): boolean {
    return this.isWindows;
  }

  public async pullPiranhaImage(
    outputStream: NodeJS.WritableStream = process.stdout,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.docker.pull(
        this.imageRef,
        (err: string, stream: NodeJS.ReadableStream) => {
          if (err) {
            return reject(err);
          } else {
            stream.on("end", () => {
              resolve();
            });
            stream.pipe(outputStream);
          }
        },
      );
    });
  }

  public async runPiranha(
    options: PiranhaRunOptions,
    outputStream: NodeJS.WritableStream = process.stdout,
    abortSignal: AbortSignal
  ): Promise<void> {
    // TODO: use yaml file to pass parameters in API Docker image - for now use same approach as PiranhaGUI of "escaping"
    // arg strings with underscores
    const escapeOption = (o: string): string => o.replaceAll(" ", "_");

    // Piranha only supports English and French just now - default to English for Portuguese
    const lang = options.lang === "fr" ? "French" : "English";

    const envString = [
      // run parameters
      `THREADS=${options.threads || 1}`,
      `--runname ${escapeOption(options.name)}`,
      `--notes ${escapeOption(options.notes)}`,
      // run settings
      `--sample-type ${options.protocol}`,
      `--positive-control ${escapeOption(options.positiveControl || "")}`,
      `--negative-control ${escapeOption(options.negativeControl || "")}`,
      // piranha output settings
      `--orientation ${options.orientation}`,
      `--output-prefix ${escapeOption(options.outputPrefix || "")}`,
      `${options.overwriteOutput ? "--overwrite" : ""}`,
      `${options.outputIntermediateFiles ? "--no-temp" : ""}`,
      `${options.allMetadataToHeader ? "--all-metadata-to-header" : ""}`,
      `${options.dateStamp ? "--datestamp" : ""}`,
      // user settings
      `--username ${escapeOption(options.userName || "")}`,
      `--institute ${escapeOption(options.institute || "")}`,
      `--language ${lang}`,
      `--medaka-model AUTO`,
    ].join(" ");

    // Because we're running as non-root user we need to make sure home and cache used by snakemake don't default to
    // /root.
    const env = ["XDG_CACHE_HOME=/tmp/.cache", "HOME=/tmp", envString];
    if (!this.isWindows) {
      env.push(`USER=${this.userName}`);
    }

    // We also need to set USER (for non-Windows) as this is used by some piranha dependencies

    const containerBarcodesFilePath = "/data/run_data/analysis/barcodes.csv";
    const containerBaseCalledPath = "/data/run_data/basecalled";
    const containerOutputPath = "/data/run_data/output";

    let containerStream: any;
    let container: undefined | Container;
    try {
      container = await this.docker.createContainer({
          Image: this.imageRef,
          Cmd: [], // default cmd
          Env: env,
          Volumes: {
            containerBarcodesFilePath: {},
            containerBaseCalledPath: {},
            containerOutputPath: {},
          },
          User: this.userMapping,
          HostConfig: {
            Binds: [
              `${options.barcodesFilePath}:${containerBarcodesFilePath}`,
              `${options.minKnowFolderPath}:${containerBaseCalledPath}`,
              `${options.outputFolderPath}:${containerOutputPath}`,
            ],
            AutoRemove: true, // rm
          },
        },
      );
      containerStream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true
      });
      containerStream.pipe(outputStream);

      const waitForAbort = (abortSignal: AbortSignal) => {
        return new Promise((_, reject) => {
          abortSignal.addEventListener('abort', () => {
            const e = new Error("Piranha run aborted");
            e.name = "AbortError";
            reject(e);
          });
        });
      };

      const doPiranhaRun = async () => {
        const result = await container.wait();
        outputStream.end();
        if (result.StatusCode !== 0) {
          throw new Error(
            `Piranha finished with non-zero exit code ${result.StatusCode}`,
          );
        }
      }

      await container.start();

      // Wait for container to finish running, or for abort to signal, whichever comes first
      await Promise.race([
        doPiranhaRun(),
        waitForAbort(abortSignal)
      ]);

    } finally {
      if (containerStream) {
        containerStream.destroy();
      }
      if (container && container.inspect().State.Running()) {
        try {
          await container.stop({ t: 5 });
        } catch (err) {
          // Already stopped
        }

      }
    }
  }




    //const [data, _] = await this.docker.run(
    // Do not await as we need to be able to configure abort signal
   /* const runPromise = this.docker.run(
      this.imageRef,
      [], // default cmd
      outputStream,
      {
        Env: env,
        Volumes: {
          containerBarcodesFilePath: {},
          containerBaseCalledPath: {},
          containerOutputPath: {},
        },
        User: this.userMapping,
        HostConfig: {
          Binds: [
            `${options.barcodesFilePath}:${containerBarcodesFilePath}`,
            `${options.minKnowFolderPath}:${containerBaseCalledPath}`,
            `${options.outputFolderPath}:${containerOutputPath}`,
          ],
          AutoRemove: true, // rm
        },
      },
    );

    // Handle the container event from the runPromise so we can use it on abort
    let runContainer: null | Container = null;
    runPromise.on("container", (container) => {
      console.log("Got container")
      runContainer = container;
    });

    abortSignal.addEventListener("abort", async () => {
      console.log("Piranha run cancel request.");
      try {
        await runContainer!.stop();
        await runContainer!.remove();
        console.log("Piranha run cancelled.");
      } catch (err) {
        console.error("Failed to cancel Piranha run:", (err as Error).message);
      }
    })

    // Wait for the run to complete
    const [data, _] = await runPromise;
    outputStream.end();

    if (data.StatusCode !== 0) {
      throw new Error(
        `Piranha finished with non-zero exit code ${data.StatusCode}`,
      );
    }
  }*/
}
