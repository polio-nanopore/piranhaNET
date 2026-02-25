export class PiranhaRunner {
    private imageRef: string;
    constructor(imageName="polionanopore/piranha", imageTag="latest") {
        this.imageRef = `${imageName}:${imageTag}`;
    }

    public async pullPiranha() {

    }

    public async runPiranha() {

    }
}