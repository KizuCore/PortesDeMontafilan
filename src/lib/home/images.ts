const imageAssets = import.meta.glob(
  "../../assets/img/**/*.{avif,jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

export const IMG = (path: string) =>
  imageAssets[`../../assets/img/${path}`] ?? path;
export const OG_IMAGE = IMG("house/ArriereCours1.avif");
export const LOGO_IMAGE = "/favicon/android-chrome-512x512.png";
