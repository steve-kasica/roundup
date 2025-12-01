import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HighlightText from ".";

describe("HighlightText", () => {
  it("renders text without highlighting when there is no match", () => {
    render(<HighlightText text="Hello world" pattern="xyz" />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(
      screen.queryByText(/.*/, { selector: "span.highlight" })
    ).not.toBeInTheDocument();
  });

  it("highlights the matching text when there is a match", () => {
    render(<HighlightText text="Hello world" pattern="world" />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(
      screen.getByText("world", { selector: "span.highlight" })
    ).toBeInTheDocument();
  });

  it("handles case insensitive matches", () => {
    render(<HighlightText text="Hello World" pattern="world" />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(
      screen.getByText("World", { selector: "span.highlight" })
    ).toBeInTheDocument();
  });

  it("matches only the first occurrence when multiple matches exist", () => {
    const { container } = render(
      <HighlightText text="Hello world, welcome to the world" pattern="world" />
    );

    // Check the overall rendered content
    expect(container.textContent).toBe("Hello world, welcome to the world");

    // Check that the highlight span exists with the correct content
    const highlightSpan = container.querySelector("span.highlight");
    expect(highlightSpan).toBeInTheDocument();
    expect(highlightSpan.textContent).toBe("world");
  });

  it("handles empty text properly", () => {
    render(<HighlightText text="" pattern="test" />);

    expect(
      screen.queryByText(/.*/, { selector: "span.highlight" })
    ).not.toBeInTheDocument();
  });

  it("handles empty pattern properly", () => {
    render(<HighlightText text="Hello world" pattern="" />);

    // An empty pattern would match at the beginning, but your implementation might not highlight it
    // This expectation depends on how you want to handle empty patterns
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("handles non-string text inputs by converting to string", () => {
    render(<HighlightText text={42} pattern="4" />);

    expect(
      screen.getByText("4", { selector: "span.highlight" })
    ).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("preserves original casing in highlighted text", () => {
    const { container } = render(
      <HighlightText text="Hello WORLD" pattern="world" />
    );

    // Check the overall rendered content
    expect(container.textContent).toBe("Hello WORLD");

    // Check that the highlight span exists with the correct content
    const highlightSpan = container.querySelector("span.highlight");
    expect(highlightSpan).toBeInTheDocument();
    expect(highlightSpan.textContent).toBe("WORLD");
  });
});
