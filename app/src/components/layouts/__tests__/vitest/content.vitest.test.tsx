import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContentLayout from "@components/layouts/content";

describe("ContentLayout", () => {
  it("renders children", () => {
    render(<ContentLayout><div>Test</div></ContentLayout>);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
