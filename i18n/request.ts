import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["en", "es"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function getSafeLocale(value: string | undefined): SupportedLocale {
  if (
    value !== undefined &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  ) {
    return value as SupportedLocale;
  }
  return "en";
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = getSafeLocale(store.get("locale")?.value);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
