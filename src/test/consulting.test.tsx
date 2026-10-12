import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ConsultingPage from "../pages/ConsultingPage";
import App from "../App";

describe("ConsultingPage", () => {
  it("renders ConsultingPage without crashing", () => {
    const { container } = render(<ConsultingPage />);
    expect(container).toBeTruthy();
  });

  it("renders App at /consulting without crashing", () => {
    window.history.pushState({}, "Test", "/consulting");
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
