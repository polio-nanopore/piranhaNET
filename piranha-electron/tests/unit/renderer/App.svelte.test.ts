import { render, screen } from "@testing-library/svelte";
import { describe, expect, test, beforeAll } from "vitest";
import App from "../../../src/renderer/src/App.svelte";
import {mockWindowElectron} from "../utils";

describe("App", () => {
  beforeAll(() => {
    mockWindowElectron();
  });

  test("renders as expected", () => {
    render(App);
    expect(screen.getByRole("img")).toHaveClass("logo");
    expect(screen.getByText(/PiranhaNET/)).toBeVisible();
    expect(screen.getByText(/Run Piranha/)).toBeVisible();
  });
});
