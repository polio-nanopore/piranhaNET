import { describe, expect, test, beforeEach, vi } from "vitest";
import { screen, render } from "@testing-library/svelte";
import TestFormField from "./TestFormField.svelte";

describe("FormField", () => {
  test("renders as expected without error", () => {
    render(TestFormField);
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("id", "test-input");
    expect(screen.queryByTestId("field-error")).toBeNull();
  });

  test("renders as expected with error", () => {
    render(TestFormField, {
      props: {
        error: ["a test error"]
      }
    });
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("id", "test-input");
    expect(screen.queryByTestId("test-input-error")).toHaveTextContent("a test error");
  });
});
