import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";
import { RECAPTCHA_SITE_KEY } from "@/constants/home";
import { getRecaptchaToken } from "@/lib/home/recaptcha";
import { Field } from "./Field";

export function Contact() {
  const { lang, t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  return (
    <section
      id="contact"
      className="bg-forest text-primary-foreground py-20 sm:py-28"
    >
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <AnimatedSection>
            <span className="eyebrow !text-background/70">
              {t("nav.contact")}
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl text-background">
              {t("home.contact.title")}
            </h2>
            <p className="mt-5 max-w-md text-background/75 leading-relaxed">
              {t("home.contact.body")}
            </p>
            <ul className="mt-8 space-y-4 text-background/90">
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  {t("home.contact.hosts")}
                </span>
                <div>Jocelyne & Christian</div>
              </li>
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  {t("home.contact.address")}
                </span>
                <div>Corseul, Bretagne</div>
              </li>
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  {t("home.contact.phone")}
                </span>
                <div>
                  <a href="tel:+33780710159" className="hover:text-terra">
                    +33 7 80 71 01 59
                  </a>
                </div>
              </li>
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  Email
                </span>
                <div>
                  <a
                    href="mailto:lesportesdemontafilan@gmail.com"
                    className="hover:text-terra break-all"
                  >
                    lesportesdemontafilan@gmail.com
                  </a>
                </div>
              </li>
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  Facebook
                </span>
                <div>
                  <a
                    href="https://www.facebook.com/LesPortesDeMontafilan"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-terra"
                  >
                    Les Portes De Montafilan
                  </a>
                </div>
              </li>
            </ul>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-6">
          <AnimatedSection delay={150}>
            <form
              className="rounded-2xl border border-background/15 bg-background/5 p-6 sm:p-8 backdrop-blur"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = e.currentTarget as HTMLFormElement;
                const data = new FormData(f);

                setSubmitState("idle");
                setSubmitMessage(null);

                if (!RECAPTCHA_SITE_KEY) {
                  setSubmitState("error");
                  setSubmitMessage(t("home.contact.captchaNotConfigured"));
                  return;
                }

                setIsSubmitting(true);

                try {
                  const captchaToken =
                    await getRecaptchaToken(RECAPTCHA_SITE_KEY);

                  const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      language: lang,
                      form: {
                        firstName: String(data.get("firstname") || "").trim(),
                        lastName: String(data.get("lastname") || "").trim(),
                        email: String(data.get("email") || "").trim(),
                        phone: String(data.get("phone") || "").trim(),
                        subject: String(
                          data.get("subject") ||
                            t("home.contact.defaultSubject"),
                        ).trim(),
                        message: String(data.get("message") || "").trim(),
                      },
                      captchaToken,
                    }),
                  });

                  const result = (await response.json().catch(() => null)) as {
                    error?: string;
                    ok?: boolean;
                  } | null;

                  if (!response.ok) {
                    throw new Error(result?.error || `HTTP ${response.status}`);
                  }

                  f.reset();
                  setSubmitState("success");
                  setSubmitMessage(t("home.contact.success"));
                } catch (error: unknown) {
                  setSubmitState("error");
                  setSubmitMessage(
                    error instanceof Error
                      ? error.message
                      : t("home.contact.error"),
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <h3 className="text-background text-xl">
                {t("home.contact.messageTitle")}
              </h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  name="firstname"
                  label={t("home.contact.firstName")}
                  required
                />
                <Field
                  name="lastname"
                  label={t("home.contact.lastName")}
                  required
                />
                <Field
                  name="email"
                  type="email"
                  label={t("home.contact.email")}
                  required
                />
                <Field name="phone" label={t("home.contact.phoneField")} />
                <Field
                  name="subject"
                  label={t("home.contact.subject")}
                  required
                  className="sm:col-span-2"
                />
                <Field
                  name="message"
                  label={t("home.contact.message")}
                  required
                  textarea
                  className="sm:col-span-2"
                />
              </div>
              {!RECAPTCHA_SITE_KEY ? (
                <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                  {t("home.contact.captchaNotConfigured")}
                </div>
              ) : null}
              {submitMessage ? (
                <div
                  className={`mt-6 rounded-xl border p-4 text-sm ${
                    submitState === "success"
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-50"
                      : "border-destructive/40 bg-destructive/10 text-destructive-foreground"
                  }`}
                >
                  {submitMessage}
                </div>
              ) : null}
              <button
                type="submit"
                className="btn-primary mt-6 w-full"
                disabled={isSubmitting || !RECAPTCHA_SITE_KEY}
              >
                {isSubmitting
                  ? t("home.contact.sending")
                  : t("home.contact.submit")}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
