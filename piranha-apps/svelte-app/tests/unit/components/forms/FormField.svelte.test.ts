import { describe, expect, test } from "vitest";
import { screen, render } from "@testing-library/svelte";
import TestFormField from "./TestFormField.svelte";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";

describe("FormField", () => {
  const user = userEvent.setup();

  test("renders as expected without error", () => {
    render(TestFormField);
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("id", "test-input");
    expect(screen.queryByTestId("field-error")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull(); // no tooltip trigger if don't specify help
  });

  test("renders as expected with error", () => {
    render(TestFormField, {
      props: {
        error: ["a test error"],
      },
    });
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("id", "test-input");
    expect(screen.queryByTestId("test-input-error")).toHaveTextContent(
      "a test error",
    );
  });

  test("renders with class", () => {
    const { container } = render(TestFormField, {
      props: { class: "test-class" },
    });
    const divElement = container.querySelector("div");
    expect(divElement).toHaveClass("test-class");
  });

  test("renders help", async () => {
    const {container} = render(TestFormField, {
      props: { help: "test help" }
    });
    expect(screen.queryByRole("button")).not.toBeNull();
    expect(container.querySelector("svg")).toBeVisible();
  });
});
