import { findAll } from "highlight-words-core";

export const highlightText = (
  searchWords: string[],
  textToHighlight: string
) => {
  const chunks = findAll({
    searchWords,
    textToHighlight,
  });
  const highlightedText = chunks
    .map((chunk) => {
      const { end, highlight, start } = chunk;
      const text = textToHighlight.substr(start, end - start);
      if (highlight) {
        return `<mark>${text}</mark>`;
      } else {
        return text;
      }
    })
    .join("");
  return highlightedText;
};
