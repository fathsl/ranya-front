import {
  AvailableLanguageTag,
  languageTag,
  setLanguageTag,
} from "../../lang/gen/runtime";
import { atomWithStoredBroadcast } from "./broadcast";
export const langAtom = atomWithStoredBroadcast<AvailableLanguageTag>(
  "lang",
  languageTag(),
  undefined,
  undefined,
  (v) => {
    if (typeof window !== "undefined") {
      document.cookie = `lang=${v}; secure; SameSite=Strict; expires=Thu, 01 Jan 10000 00:00:00 UTC; path=/;`;
    }
    setLanguageTag(v);
  }
);
