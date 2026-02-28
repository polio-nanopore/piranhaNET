import { PiranhaRunOptions } from "./types.js"
import Docker from "dockerode";

// TODO: add description
// TODO: add network
export class PiranhaRunner {
    private readonly imageRef: string;
    private docker = new Docker();
    constructor(imageName="polionanopore/piranha", imageTag="latest") {
        this.imageRef = `${imageName}:${imageTag}`;
    }

    public async pullPiranhaImage(outputStream: NodeJS.WritableStream = process.stdout) {
        return new Promise<void>((resolve, reject) => {
            this.docker.pull(this.imageRef, (err, stream) => {
                if (err) {
                    return reject(err)
                } else {
                    stream.pipe(outputStream);
                    resolve();
                }
            });
        });
    }

    public async runPiranha(options: PiranhaRunOptions, outputStream: NodeJS.WritableStream = process.stdout) {
        const env = [
          `THREADS=${options.threads || 1}`,
          `POSITIVE_CONTROL=${options.positiveControl}`,
          `NEGATIVE_CONTROL=${options.negativeControl}`
        ];

        const containerRunPath = "/data/run_data/analysis";
        const containerBaseCalledPath = "/data/run_data/basecalled";
        const containerOutputPath = "/data/run_data/output";

        return this.docker.run(this.imageRef,
            [], // default cmd
            outputStream,
            {
                Env: env,
                Volumes: {
                    containerRunPath: {},
                    containerBaseCalledPath: {},
                    containerOutputPath: {}
                },
                HostConfig: {
                    Binds: [
                        `${options.runPath}:${containerRunPath}`,
                        `${options.basecalledPath}:${containerBaseCalledPath}`,
                        `${options.outputPath}:${containerOutputPath}`
                    ],
                    AutoRemove: true // rm
                }
            }
        );
    }
}