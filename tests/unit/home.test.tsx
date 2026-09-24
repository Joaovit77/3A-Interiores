import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home provisória", () => {
  it("mostra o nome da marca como título principal", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Luísa Amélia Interiores",
      }),
    ).toBeInTheDocument();
  });
});
