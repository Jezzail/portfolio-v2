/**
 * Unit test — ErrorBoundary
 *
 * Verifies that ErrorBoundary renders children normally and shows
 * a fallback UI when a child component throws a render error.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function BrokenComponent(): never {
  throw new Error("Test render error");
}

describe("ErrorBoundary", () => {
  // Suppress React's console.error output for expected errors in tests
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders the default fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Content failed to load/i)).toBeInTheDocument();
  });

  it("renders a custom fallback when provided and a child throws", () => {
    render(
      <ErrorBoundary fallback={<p>Custom error message</p>}>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(
      screen.queryByText(/Content failed to load/i),
    ).not.toBeInTheDocument();
  });
});
