import { useEffect, useRef, useState } from "react";
import FlagIcon from "./FlagIcon";
import { useAtom } from "jotai";
import { langAtom } from "@/store/store";
import { availableLanguageTags } from "../../lang/gen/runtime";

const LangSelector: React.FC = () => {
  const [lang, setLang] = useAtom(langAtom);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const renderLangName = (
    locale: string,
    short: boolean = true
  ): JSX.Element | null => {
    switch (locale) {
      case "ar":
        return (
          <div className="flex items-center">
            <FlagIcon countryCode="sa" />
            &nbsp;
            <span className="ml-2 mt-1">{short ? "Ar" : "العربية"}</span>
          </div>
        );
      case "en":
        return (
          <div className="flex items-center">
            <FlagIcon countryCode="us" />
            &nbsp;
            <span className="ml-2 mt-1">{short ? "En" : "English"}</span>
          </div>
        );
      case "fr":
        return (
          <div className="flex items-center">
            <FlagIcon countryCode="fr" />
            <span className="ml-2 mt-1">{short ? "Fr" : "Français"}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleClickOutside = (event: MouseEvent): void => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mx-4 inline-flex items-center rounded-lg px-4 py-2 text-center text-sm font-medium text-secondary-content focus:outline-none focus:ring-4 focus:ring-secondary"
        type="button"
      >
        {renderLangName(lang)}
      </button>

      <div
        className={`z-10 ${
          isOpen ? "" : "hidden"
        } absolute mt-3 w-28 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700`}
      >
        <ul className="px-1 py-2 text-sm text-gray-700">
          {availableLanguageTags.map((lang, i) => (
            <li
              key={lang}
              className={`cursor-pointer p-3 ${
                i < 2 ? "border-b border-b-gray-300" : ""
              } `}
            >
              <button
                onClick={() => {
                  setLang(lang);
                  setIsOpen(false);
                  location?.reload();
                }}
              >
                {renderLangName(lang, false)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LangSelector;
