import { render, screen } from "@testing-library/svelte";
import { describe, expect, test, beforeAll } from "vitest";
import Versions from "../../../../src/renderer/src/components/Versions.svelte";
import {mockWindowElectron} from "../../utils";

describe("Version", () => {
  beforeAll(() => {
    mockWindowElectron();
  });

  test("renders as expected", () => {
    render(Versions);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBe(3);
    expect(listItems.at(0)).toHaveTextContent("Electron v1.1.1");
    expect(listItems.at(1)).toHaveTextContent("Chromium v2.2.2");
    expect(listItems.at(2)).toHaveTextContent("Node v3.3.3");
  });
});
