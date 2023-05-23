type SupportedLocales = "en-US" | "ar-SA";

/**
 * Returns a comma-separated string of all alphanumeric or Arabic characters in the given locale
 * @param locale The locale to get the characters for. Supports 'en-US' and 'ar-SA'
 * @returns A comma-separated string of alphanumeric or Arabic characters
 */
export const getAlphanumericCharacters = (
  locale: SupportedLocales = "en-US"
) => {
  const characterRanges: Record<SupportedLocales, `${string}-${string}`[]> = {
    "en-US": ["a-z", "0-9"],
    "ar-SA": ["٠-٩", "ء-ي"],
  };

  const ranges = characterRanges[locale];
  if (!ranges) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  let characters = ranges.map((range) => {
    const [start, end] = range.split("-") as [string, string];
    const charCodes = Array.from(
      { length: end.charCodeAt(0) - start.charCodeAt(0) + 1 },
      (_, i) => String.fromCharCode(start.charCodeAt(0) + i)
    );

    return charCodes;
  });

  if (locale === "en-US") {
    const lowerCaseRange = "a-z";
    const [start, end] = lowerCaseRange.split("-") as [string, string];

    const upperCaseChars = Array.from(
      { length: end.charCodeAt(0) - start.charCodeAt(0) + 1 },
      (_, i) => "shift+" + String.fromCharCode(start.charCodeAt(0) + i)
    );

    characters = [...characters, upperCaseChars];
  }

  return characters;
};
