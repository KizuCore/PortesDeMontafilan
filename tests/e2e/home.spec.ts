import { expect, test, type Page } from "@playwright/test";

type BusyRange = {
  start: string;
  end: string;
};

type ContactPayload = {
  language?: string;
  form?: Record<string, string>;
  captchaToken?: string;
};

const pricingConfig = {
  lowSeasonNight: 61,
  lowSeasonWeek: 400,
  midSeasonNight: 68,
  midSeasonWeek: 460,
  highSeasonNight: 100,
  highSeasonWeek: 700,
  cleaningFee: 60,
  touristTaxPerAdultPerNight: 1.32,
  towelPackPerPerson: 6.5,
  minNightsLowMid: 2,
  minNightsHigh: 4,
};

async function mockHomeApis(
  page: Page,
  options: {
    busyRanges?: BusyRange[];
    onContact?: (payload: ContactPayload) => void;
  } = {},
) {
  await page.addInitScript(() => {
    (
      window as Window & {
        grecaptcha?: {
          ready: (callback: () => void) => void;
          execute: () => Promise<string>;
        };
      }
    ).grecaptcha = {
      ready: (callback) => callback(),
      execute: async () => "e2e-recaptcha-token",
    };
  });

  await page.route("**/recaptcha/**", (route) => route.abort());
  await page.route("**/api/availability", (route) =>
    route.fulfill({
      json: {
        busyRanges: options.busyRanges ?? [
          { start: "2026-06-20", end: "2026-06-22" },
        ],
      },
    }),
  );
  await page.route("**/api/pricing-config", (route) =>
    route.fulfill({
      json: {
        pricingConfig,
        source: "default",
      },
    }),
  );
  await page.route("**/api/estimate", (route) =>
    route.fulfill({
      json: {
        estimate: {
          nights: 2,
          season: "mid",
          minNightsRequired: 2,
          rateBreakdown: [
            { season: "mid", nights: 2, nightlyRate: 68, subtotal: 136 },
          ],
          stayBasePrice: 136,
          cleaningFee: 60,
          touristTax: 5.28,
          towelPacksPrice: 0,
          totalEstimated: 201.28,
          valid: true,
        },
      },
    }),
  );
  await page.route("**/api/contact", async (route) => {
    options.onContact?.(route.request().postDataJSON() as ContactPayload);
    await route.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/airbnb-link", (route) =>
    route.fulfill({
      json: { redirectUrl: "https://airbnb.example/reserve" },
    }),
  );
}

test("home page renders and desktop navigation reaches the main anchors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockHomeApis(page);
  await page.goto("/");

  await expect(
    page.locator("h1").filter({ hasText: /terre et mer/i }),
  ).toBeVisible();

  for (const id of [
    "gite",
    "equipements",
    "galerie",
    "region",
    "reservation",
    "contact",
  ]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }

  const header = page.locator("header");
  for (const id of ["gite", "equipements", "galerie", "region", "contact"]) {
    await header.locator(`a[href="#${id}"]`).click();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }

  await header.locator('a[href="#reservation"]').click();
  await expect(page.locator("#reservation")).toBeInViewport();
});

test("mobile navigation opens, follows a link, and closes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockHomeApis(page);
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: /menu/i });
  await expect(menuButton).toBeVisible();

  await menuButton.click();
  const closeButton = page.getByRole("button", { name: /fermer/i });
  await expect(closeButton).toBeVisible();

  await page.locator('div.fixed a[href="#gite"]').click();
  await expect(closeButton).toBeHidden();
  await expect(page.locator("#gite")).toBeInViewport();
});

test("contact form fields can be filled and submitted with mocked captcha", async ({
  page,
}) => {
  let contactPayload: ContactPayload | undefined;
  await mockHomeApis(page, {
    onContact: (payload) => {
      contactPayload = payload;
    },
  });
  await page.goto("/#contact");

  const contact = page.locator("#contact");
  await expect(contact.locator('input[name="firstname"]')).toBeVisible();
  await contact.locator('input[name="firstname"]').fill("Jocelyne");
  await contact.locator('input[name="lastname"]').fill("Robert");
  await contact.locator('input[name="email"]').fill("guest@example.com");
  await contact.locator('input[name="phone"]').fill("0102030405");
  await contact.locator('input[name="subject"]').fill("Reservation");
  await contact.locator('textarea[name="message"]').fill("Bonjour");

  await contact.getByRole("button", { name: /envoyer le message/i }).click();

  await expect.poll(() => contactPayload).toBeTruthy();
  expect(contactPayload).toMatchObject({
    language: "fr",
    form: {
      firstName: "Jocelyne",
      lastName: "Robert",
      email: "guest@example.com",
      phone: "0102030405",
      subject: "Reservation",
      message: "Bonjour",
    },
    captchaToken: "e2e-recaptcha-token",
  });
  await expect(page.getByText(/Message env/i)).toBeVisible();
});

test("reservation section renders with mocked availability and disabled action", async ({
  page,
}) => {
  await mockHomeApis(page, {
    busyRanges: [{ start: "2026-06-20", end: "2026-06-22" }],
  });
  await page.goto("/#reservation");

  const reservation = page.locator("#reservation");
  await expect(
    reservation.getByRole("heading", { name: /choisissez vos dates/i }),
  ).toBeVisible();
  await expect(
    reservation.locator(".rdp-root, [role='grid']").first(),
  ).toBeVisible();
  await expect(
    reservation.getByRole("button", { name: /demander ces dates/i }),
  ).toBeDisabled();
});
