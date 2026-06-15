import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Nav } from "./Nav";
import { createI18nMock } from "@/test/homeI18n";

vi.mock("@/lib/i18n", () => ({
  useI18n: () => createI18nMock(),
}));

vi.mock("@/components/LangSwitch", () => ({
  LangSwitch: ({ tone = "dark" }: { tone?: "dark" | "light" }) => (
    <div data-testid={`lang-switch-${tone}`}>Lang switch</div>
  ),
}));

vi.mock("@/components/AnimatedSection", () => ({
  AnimatedSection: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("Nav", () => {
  it("opens and closes the mobile menu", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    await user.click(screen.getByRole("button", { name: "Menu" }));

    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByTestId("lang-switch-light")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fermer" }));

    expect(
      screen.queryByRole("button", { name: "Fermer" }),
    ).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the mobile menu after following a menu link", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const overlay = document.querySelector(".fixed");
    expect(overlay).toBeInTheDocument();

    await user.click(
      within(overlay as HTMLElement).getByRole("link", { name: /Le gite/ }),
    );

    expect(
      screen.queryByRole("button", { name: "Fermer" }),
    ).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });
});
