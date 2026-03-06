import { render, screen, waitFor} from "@testing-library/svelte";
import { describe, expect, test, beforeEach } from "vitest";
import App from "../../../src/renderer/src/App.svelte";
import { mockWindowElectron , mockWindowAPI} from "../utils";

// TODO use vitest-browser-svelte
describe("App", () => {
  beforeEach(() => {
    mockWindowElectron();
    mockWindowAPI();
  });

  test("renders as expected before initialized", () => {
    render(App);
    expect(screen.getByRole("img")).toHaveClass("logo");
    expect(screen.getByText(/PiranhaNET/)).toBeVisible();
    expect(screen.getByText(/Initializing.../)).toBeVisible();
  });

  test("renders as expected after initialized", async () => {
    render(App);

    expect(window.api.onInitialized).toHaveBeenCalled();
    const initialize = window.api.onInitialized.mock.calls[0][0];
    initialize();

    await waitFor(() => expect(screen.getByText(/Run Piranha/)).toBeVisible());
    expect(screen.queryByText(/Initializing.../)).toBeNull();
  });

  test("Stream chunk and end messages are added to log", async () => {
    render(App);

    const initialize = window.api.onInitialized.mock.calls[0][0];
    initialize();
    await waitFor(() => expect(screen.getByText(/Run Piranha/)).toBeVisible());
    const log = screen.getByTestId("log");

    expect(window.api.onChunk).toHaveBeenCalled();
    const addChunk = window.api.onChunk.mock.calls[0][0];
    const encoder = new TextEncoder('utf-8');
    addChunk(encoder.encode("test log message"));
    await waitFor(() =>  expect(log).toHaveTextContent(/test log message/));

    expect(window.api.onEnd).toHaveBeenCalled();
    const end = window.api.onEnd.mock.calls[0][0];
    end();
    await waitFor(() =>  expect(log).toHaveTextContent("Piranha Run Finished"));
  });
});
