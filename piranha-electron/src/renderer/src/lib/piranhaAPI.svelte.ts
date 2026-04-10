export class PiranhaAPI {
  #initialized = $state(false);
  #running = $state(false);
  #error = $state("");
  #log: string[] = $state([]);
  #decoder = new TextDecoder("utf-8");

  constructor() {
    window.api?.onInitialized(() => {
      this.#initialized = true;
    });

    window.api?.onChunk((chunk) => {
      const textChunk = this.#decoder.decode(chunk, { stream: true });
      this.#log.push(`${textChunk}`);
    });
    window.api?.onEnd(() => {
      this.#log.push("Piranha Run Finished");
      this.#running = false;
    });
    window.api?.onError((e, detail) => {
      this.#error = e;
      console.error(detail); // TODO: we should make error details available to users more generically
    });
  }

  get initialized(): boolean {
    return this.#initialized;
  }

  get running(): boolean {
    return this.#running;
  }

  get error(): string {
    return this.#error;
  }

  get log(): string[] {
    return this.#log;
  }

  runPiranha(): void {
    // TODO throw error if we're already running
    this.#log = [];
    // Pre-canned run with test data, to be replaced with user-selected parameters
    const testDataPath = "/home/emmarussell/dev/piranhaNET/test-data/";
    const options = {
        barcodesFilePath: `${testDataPath}barcodes.csv`,
        baseCalledPath: `${testDataPath}demultiplexed`,
        outputPath: "/home/emmarussell/dev/piranhaNET/test-results",
        positiveControl: "Pos1,P2",
        negativeControl: "my negative control",
        threads: 1,
      };
    window.api.runPiranha(options);
    this.#running = true;
  }

  testMessageMain(): void {
    // Prove that we can still message main while piranha is running
    // - should see it log a message to the console
    window.api.testMessage();
  }
}

export const piranhaAPI = new PiranhaAPI();
