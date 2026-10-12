import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ProfessionalPage from "../pages/ProfessionalPage";
import App from "../App";

describe("ProfessionalPage", () => {
  it("renders ProfessionalPage without crashing", () => {
    const { container } = render(<ProfessionalPage />);
    expect(container).toBeTruthy();
  });

  it("renders App at /professionals without crashing", () => {
    window.history.pushState({}, "Test", "/professionals");
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
