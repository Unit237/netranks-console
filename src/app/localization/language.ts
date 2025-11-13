import { useState } from "react";
import { HubType, useHub } from '../utils/Hub';
import keys from '../utils/keys';
import en_GB from "./translations/en-GB";
import tr_TR from "./translations/tr-TR";


export const Languages = {
    "en-GB": en_GB, // TODO: load language files async - import("./translations/en-GB.js")
    "tr-TR": tr_TR, // TODO: load language files async - import("./translations/tr-TR.js")
};

const defaultLocale = "en-GB";
const fallbackLanguage = Languages["en-GB"];
let selectedLanguage = fallbackLanguage;

function getBrowserLocale() {
    try {
        const locale = navigator.language;
        const tokens = (locale ? ("" + locale) : "").split("-");
        return {
            Locale: locale,
            LanguageCode: tokens[0] || "",
            CountryCode: tokens[1] || ""
        };
    } catch (error) {
        console.warn("Failed to get locale", error);
        return {
            Locale: "",
            LanguageCode: "",
            CountryCode: ""
        }
    }
}

export async function loadLanguage() {
    const browserLocale = getBrowserLocale().Locale;
    let languageLocale = localStorage.getItem(keys.localStorage.SELECTED_LANGUAGE_LOCALE);

    if (!languageLocale) {
        // if there's no selected language, get it from browser locale
        languageLocale = browserLocale;
    }

    if (!Languages[languageLocale]) {
        // if we don't have this language, use the default one
        languageLocale = defaultLocale;
    }

    setLanguageLocale(languageLocale);
}

export function setLanguageLocale(languageLocale) {
    selectedLanguage = Languages[languageLocale];

    fillMissingFields(selectedLanguage, fallbackLanguage);

    localStorage.setItem(keys.localStorage.SELECTED_LANGUAGE_LOCALE, languageLocale);
}

function fillMissingFields(language, fallback) {

    if (language === fallback) {
        return;
    }

    Object.keys(fallback).forEach(x => {
        if (typeof (fallback[x]) === "object") {
            if (!language[x]) {
                language[x] = {};
            }
            fillMissingFields(language[x], fallback[x]);
        } else {
            if (language[x] === undefined) {
                console.warn("Missing translation", x, fallback[x]);
                language[x] = fallback[x];
            }
        }
    });
}

export function getSelectedLanguage() {
    return selectedLanguage;
}

export function useLanguage() {
    const [language, setLanguage] = useState(selectedLanguage);
    useHub(HubType.LanguageChanged, setLanguage);
    return language;
}

