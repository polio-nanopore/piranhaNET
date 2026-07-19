import type { PiranhaRunOptions } from "../../../svelte-app/src/shared/types";
import Docker from "dockerode";
import { userInfo } from "node:os";

// Class for pulling piranha docker image and using it to run piranha jobs, used by Electron main process
export class PiranhaRunner {
  private readonly imageRef: string;
  private readonly userMapping: string | undefined;
  private docker = new Docker();
  constructor(imageName = "polionanopore/piranha", imageTag = "latest") {
    this.imageRef = `${imageName}:${imageTag}`;
    const { uid, gid } = userInfo();
    // We use the current user to run docker on Linux as otherwise it runs as root and causes file permission problems
    this.userMapping =
      process.platform !== "win32" && uid !== -1 ? `${uid}:${gid}` : undefined;
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
  ): Promise<void> {
    // TODO: use yaml file to pass parameters in API Docker image - for now use same approach as PiranhaGUI of "escaping"
    // arg strings with underscores
    const escapeOption = (o: string): string => o.replaceAll(" ", "_");

    // Piranha only supporte English and French just now - default to English for Portuguese
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
    ].join(" ");

    // Because we're running as non-root user we need to make sure home and cache used by snakemake don't default to
    // /root
    const env = ["XDG_CACHE_HOME=/tmp/.cache", "HOME=/tmp", envString];

    const containerBarcodesFilePath = "/data/run_data/analysis/barcodes.csv";
    const containerBaseCalledPath = "/data/run_data/basecalled";
    const containerOutputPath = "/data/run_data/output";

    const [data, _] = await this.docker.run(
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
    outputStream.end();

    if (data.StatusCode !== 0) {
      throw new Error(
        `Piranha finished with non-zero exit code ${data.StatusCode}`,
      );
    }
  }
}
