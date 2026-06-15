import { beforeEach, describe, expect, it, vi } from "vitest";

describe("recaptcha helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    delete window.grecaptcha;
    document
      .querySelectorAll(
        'script[src^="https://www.google.com/recaptcha/api.js"]',
      )
      .forEach((script) => script.remove());
  });

  it("uses an already loaded grecaptcha instance", async () => {
    const execute = vi.fn().mockResolvedValue("captcha-token");
    window.grecaptcha = {
      ready: (callback) => callback(),
      execute,
    };

    const { getRecaptchaToken } = await import("./recaptcha");

    await expect(getRecaptchaToken("site-key")).resolves.toBe("captcha-token");
    expect(execute).toHaveBeenCalledWith("site-key", { action: "contact" });
    expect(
      document.querySelector(
        'script[src^="https://www.google.com/recaptcha/api.js"]',
      ),
    ).not.toBeInTheDocument();
  });

  it("loads the recaptcha script when grecaptcha is not ready yet", async () => {
    const { getRecaptchaToken } = await import("./recaptcha");
    const tokenPromise = getRecaptchaToken("site-key");

    const script = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.google.com/recaptcha/api.js"]',
    );
    expect(script).toBeInTheDocument();
    expect(script?.src).toContain("render=site-key");

    window.grecaptcha = {
      ready: (callback) => callback(),
      execute: vi.fn().mockResolvedValue("captcha-token"),
    };
    script?.dispatchEvent(new Event("load"));

    await expect(tokenPromise).resolves.toBe("captcha-token");
  });

  it("uses an existing recaptcha script tag before grecaptcha is ready", async () => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=site-key";
    document.head.appendChild(script);

    const { getRecaptchaToken } = await import("./recaptcha");
    const tokenPromise = getRecaptchaToken("site-key");

    window.grecaptcha = {
      ready: (callback) => callback(),
      execute: vi.fn().mockResolvedValue("captcha-token"),
    };
    script.dispatchEvent(new Event("load"));

    await expect(tokenPromise).resolves.toBe("captcha-token");
    expect(
      document.querySelectorAll(
        'script[src^="https://www.google.com/recaptcha/api.js"]',
      ),
    ).toHaveLength(1);
  });

  it("rejects when an existing recaptcha script fails to load", async () => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=site-key";
    document.head.appendChild(script);

    const { getRecaptchaToken } = await import("./recaptcha");
    const tokenPromise = getRecaptchaToken("site-key");

    script.dispatchEvent(new Event("error"));

    await expect(tokenPromise).rejects.toBeUndefined();
  });

  it("throws when the script loads without exposing grecaptcha", async () => {
    const { getRecaptchaToken } = await import("./recaptcha");
    const tokenPromise = getRecaptchaToken("site-key");
    const script = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.google.com/recaptcha/api.js"]',
    );

    script?.dispatchEvent(new Event("load"));

    await expect(tokenPromise).rejects.toThrow("RECAPTCHA_NOT_LOADED");
  });
});
