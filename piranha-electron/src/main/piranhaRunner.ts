import type { PiranhaRunOptions } from "./types.js";
import Docker from "dockerode";

// Class for pulling piranha docker image and using it to run piranha jobs, used by Electron main process
export class PiranhaRunner {
  private readonly imageRef: string;
  private docker = new Docker();
  constructor(imageName = "polionanopore/piranha", imageTag = "latest") {
    this.imageRef = `${imageName}:${imageTag}`;
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
    const env = [
      `THREADS=${options.threads || 1}`,
      `POSITIVE_CONTROL=${options.positiveControl}`,
      `NEGATIVE_CONTROL=${options.negativeControl}`,
    ];

    const containerBarcodesFilePath = "/data/run_data/analysis/barcodes.csv";
    const containerBaseCalledPath = "/data/run_data/basecalled";
    const containerOutputPath = "/data/run_data/output";

    await this.docker.run(
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
        HostConfig: {
          Binds: [
            `${options.barcodesFilePath}:${containerBarcodesFilePath}`,
            `${options.baseCalledPath}:${containerBaseCalledPath}`,
            `${options.outputPath}:${containerOutputPath}`,
          ],
          AutoRemove: true, // rm
        },
      },
    );
    outputStream.end();
  }
}
