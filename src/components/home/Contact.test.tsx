import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Contact } from "./Contact";
import { createI18nMock } from "@/test/homeI18n";

const mockState = vi.hoisted(() => ({
  recaptchaSiteKey: undefined as string | undefined,
}));
const getRecaptchaTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/constants/home", () => ({
  get RECAPTCHA_SITE_KEY() {
    return mockState.recaptchaSiteKey;
  },
}));

vi.mock("@/lib/home/recaptcha", () => ({
  getRecaptchaToken: (...args: unknown[]) => getRecaptchaTokenMock(...args),
}));

vi.mock("@/lib/i18n", () => ({
  useI18n: () => createI18nMock(),
}));

vi.mock("@/components/AnimatedSection", () => ({
  AnimatedSection: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

async function fillRequiredFields() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Prenom *"), "Jocelyne");
  await user.type(screen.getByLabelText("Nom *"), "Robert");
  await user.type(screen.getByLabelText("Email *"), "guest@example.com");
  await user.type(screen.getByLabelText("Telephone"), "0102030405");
  await user.type(screen.getByLabelText("Sujet *"), "Reservation");
  await user.type(screen.getByLabelText("Message *"), "Bonjour");

  return user;
}

describe("Contact", () => {
  beforeEach(() => {
    mockState.recaptchaSiteKey = undefined;
    getRecaptchaTokenMock.mockReset();
    getRecaptchaTokenMock.mockResolvedValue("captcha-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);
  });

  it("renders the main contact form fields", () => {
    render(<Contact />);

    expect(screen.getByLabelText("Prenom *")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom *")).toBeInTheDocument();
    expect(screen.getByLabelText("Email *")).toBeInTheDocument();
    expect(screen.getByLabelText("Sujet *")).toBeInTheDocument();
    expect(screen.getByLabelText("Message *")).toBeInTheDocument();
  });

  it("disables submit and shows an error when reCAPTCHA is not configured", () => {
    render(<Contact />);

    expect(
      screen.getByRole("button", { name: "Envoyer le message" }),
    ).toBeDisabled();
    expect(
      screen.getByText("La protection anti-spam n'est pas configuree."),
    ).toBeInTheDocument();
  });

  it("submits the expected payload when the form and reCAPTCHA are valid", async () => {
    mockState.recaptchaSiteKey = "site-key";
    const user = await fillAfterRender();

    await user.click(
      screen.getByRole("button", { name: "Envoyer le message" }),
    );

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/contact",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(JSON.parse(String(options?.body))).toEqual({
      language: "fr",
      form: {
        firstName: "Jocelyne",
        lastName: "Robert",
        email: "guest@example.com",
        phone: "0102030405",
        subject: "Reservation",
        message: "Bonjour",
      },
      captchaToken: "captcha-token",
    });
  });

  it("shows a success message when the API responds ok", async () => {
    mockState.recaptchaSiteKey = "site-key";
    const user = await fillAfterRender();

    await user.click(
      screen.getByRole("button", { name: "Envoyer le message" }),
    );

    expect(
      await screen.findByText(
        "Message envoye. Nous vous repondrons rapidement par email.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an error message when the API fails", async () => {
    mockState.recaptchaSiteKey = "site-key";
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "CONTACT_FAILED" }),
    } as Response);
    const user = await fillAfterRender();

    await user.click(
      screen.getByRole("button", { name: "Envoyer le message" }),
    );

    expect(await screen.findByText("CONTACT_FAILED")).toBeInTheDocument();
  });
});

async function fillAfterRender() {
  render(<Contact />);
  return fillRequiredFields();
}
