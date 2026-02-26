import Dockerode from "dockerode-ts";

export class PiranhaRunner {
    private readonly imageRef: string;
    private docker = new Dockerode();
    constructor(imageName="polionanopore/piranha", imageTag="latest") {
        this.imageRef = `${imageName}:${imageTag}`;
    }

    // TODO: add read stream to pipe to, same as we'll do for run
    public pullPiranha(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.docker.pull(this.imageRef, (err, stream) => {
                if (err) {
                    return reject(err)
                } else {
                    stream.pipe(process.stdout);
                    resolve();
                }
            });
        });
    }

    public async runPiranha() {

    }
}