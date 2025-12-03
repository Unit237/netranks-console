import { useState } from "react";
import { HubType, useHub } from "../utils/Hub";
import keys from "../utils/keys";

import en_GB from "./translations/en-GB";
import tr_TR from "./translations/tr-TR";

// -------------------------
// Types
// -------------------------

export type TranslationObject = Record<string, any>;

export interface BrowserLocale {
  Locale: string;
  LanguageCode: string;
  CountryCode: string;
}

export type LocaleKey = "en-GB" | "tr-TR";

export const Languages: Record<LocaleKey, TranslationObject> = {
  "en-GB": en_GB,
  "tr-TR": tr_TR,
};

const defaultLocale: LocaleKey = "en-GB";
const fallbackLanguage: TranslationObject = Languages["en-GB"];

let selectedLanguage: TranslationObject = fallbackLanguage;

// -------------------------
// Helpers
// -------------------------

function getBrowserLocale(): BrowserLocale {
  try {
    const locale = navigator.language;
    const tokens = (locale ? String(locale) : "").split("-");

    return {
      Locale: locale,
      LanguageCode: tokens[0] || "",
      CountryCode: tokens[1] || "",
    };
  } catch (error) {
    console.warn("Failed to get locale", error);
    return {
      Locale: "",
      LanguageCode: "",
      CountryCode: "",
    };
  }
}

export async function loadLanguage(): Promise<void> {
  const browserLocale = getBrowserLocale().Locale as LocaleKey;
  let languageLocale = localStorage.getItem(
    keys.localStorage.SELECTED_LANGUAGE_LOCALE
  ) as LocaleKey | null;

  if (!languageLocale) {
    // Fallback to browser locale
    languageLocale = browserLocale || defaultLocale;
  }

  if (!(languageLocale in Languages)) {
    // If language not supported → fallback
    languageLocale = defaultLocale;
  }

  setLanguageLocale(languageLocale);
}

export function setLanguageLocale(languageLocale: LocaleKey): void {
  const language = Languages[languageLocale];

  selectedLanguage = language;

  fillMissingFields(selectedLanguage, fallbackLanguage);

  localStorage.setItem(
    keys.localStorage.SELECTED_LANGUAGE_LOCALE,
    languageLocale
  );
}

function fillMissingFields(
  language: TranslationObject,
  fallback: TranslationObject
): void {
  if (language === fallback) return;

  Object.keys(fallback).forEach((key) => {
    const fallbackValue = fallback[key];
    const languageValue = language[key];

    if (typeof fallbackValue === "object" && fallbackValue !== null) {
      if (!languageValue || typeof languageValue !== "object") {
        language[key] = {};
      }
      fillMissingFields(language[key], fallbackValue);
    } else {
      if (languageValue === undefined) {
        console.warn("Missing translation", key, fallbackValue);
        language[key] = fallbackValue;
      }
    }
  });
}

export function getSelectedLanguage(): TranslationObject {
  return selectedLanguage;
}

export function useLanguage(): TranslationObject {
  const [language, setLanguage] = useState<TranslationObject>(selectedLanguage);

  useHub(HubType.LanguageChanged, setLanguage);

  return language;
}
