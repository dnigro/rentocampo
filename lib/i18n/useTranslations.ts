"use client";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

export function useTranslations() {
  const country = useRegionalCountry();
  return {country, t: (key: MessageKey) => translate(country,key)};
}
