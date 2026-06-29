import { has, isEqual, uniq } from "lodash";

import { getConsonant, getVowel, BCK } from "../glyph";

import { ReverseSyllableStatus, SelectionState } from "./state";
import { Context, Grapheme, Word } from "./db";

const graphemeMatchesFilters = (
  g: number,
  vowelFilter: number | null,
  consonantFilter: number | null,
  reverseSyllableFilter: ReverseSyllableStatus,
  partial: boolean
): {
  matchesVowel: boolean;
  matchesConsonant: boolean;
  reverseSyllablePass: boolean;
} => {
  let matchesVowel = true;
  let matchesConsonant = true;
  if (vowelFilter != null) {
    matchesVowel = false;
    if (partial) {
      matchesVowel = (getVowel(g) | vowelFilter) === getVowel(g);
    } else {
      matchesVowel = getVowel(g) === vowelFilter;
    }
  }
  if (consonantFilter != null) {
    matchesConsonant = false;
    if (partial) {
      matchesConsonant =
        (getConsonant(g) | consonantFilter) === getConsonant(g);
    } else {
      matchesConsonant = getConsonant(g) === consonantFilter;
    }
  }
  let reverseSyllablePass = true;
  if (reverseSyllableFilter === "present") {
    reverseSyllablePass = (g | BCK) === g;
  } else if (reverseSyllableFilter === "absent") {
    reverseSyllablePass = (g | BCK) !== g;
  }
  return { matchesVowel, matchesConsonant, reverseSyllablePass };
};

const getTotalPassValue = (
  vowelFilter: number | null,
  consonantFilter: number | null,
  matchesVowel: boolean,
  matchesConsonant: boolean,
  reverseSyllablePass: boolean,
  exclusive: boolean
): boolean => {
  let vowelConsonantCombinedPass = false;
  if (vowelFilter === null && consonantFilter === null) {
    vowelConsonantCombinedPass = true;
  } else {
    if (vowelFilter === null) {
      vowelConsonantCombinedPass = matchesConsonant;
    } else if (consonantFilter === null) {
      vowelConsonantCombinedPass = matchesVowel;
    } else {
      if (exclusive) {
        vowelConsonantCombinedPass = matchesVowel && matchesConsonant;
      } else {
        vowelConsonantCombinedPass = matchesVowel || matchesConsonant;
      }
    }
  }
  return reverseSyllablePass && vowelConsonantCombinedPass;
};

export const calcVowelGraphemes = (
  {
    graphemeFilterDirection,
    selectedGrapheme,
    selectedNGram,
    partial,
    mode,
  }: Pick<
    SelectionState,
    | "graphemeFilterDirection"
    | "selectedGrapheme"
    | "selectedNGram"
    | "partial"
    | "mode"
  >,
  graphemes: Grapheme[] | undefined
): number[] => {
  if (!graphemes) return [];
  const allVowelGlyphs = uniq(graphemes.map((g) => getVowel(g.id))).sort(
    (a, b) => a - b
  );
  if (graphemeFilterDirection === "left") {
    return allVowelGlyphs.filter((g) => {
      if (mode === "ngrams" && selectedNGram) {
        return selectedNGram.reduce((acc, val) => {
          if (partial) {
            return (
              acc || (g | getVowel(parseInt(val))) === getVowel(parseInt(val))
            );
          } else {
            return acc || g === getVowel(parseInt(val));
          }
        }, false);
      } else if (mode === "graphemes" && selectedGrapheme) {
        if (partial) {
          return (
            (g | getVowel(selectedGrapheme)) === getVowel(selectedGrapheme)
          );
        } else {
          return g === getVowel(selectedGrapheme);
        }
      } else return true;
    });
  } else return allVowelGlyphs;
};

export const calcConsonantGraphemes = (
  {
    graphemeFilterDirection,
    selectedGrapheme,
    selectedNGram,
    partial,
    mode,
  }: Pick<
    SelectionState,
    | "graphemeFilterDirection"
    | "selectedGrapheme"
    | "selectedNGram"
    | "partial"
    | "mode"
  >,
  graphemes: Grapheme[] | undefined
): number[] => {
  if (!graphemes) return [];
  const allConsonantGlyphs = uniq(
    graphemes.map((g) => getConsonant(g.id))
  ).sort((a, b) => a - b);
  if (graphemeFilterDirection === "left") {
    return allConsonantGlyphs.filter((g) => {
      if (mode === "ngrams" && selectedNGram) {
        return selectedNGram.reduce((acc, val) => {
          if (partial) {
            return (
              acc ||
              (g | getConsonant(parseInt(val))) === getConsonant(parseInt(val))
            );
          } else {
            return acc || g === getConsonant(parseInt(val));
          }
        }, false);
      } else if (mode === "graphemes" && selectedGrapheme) {
        if (partial) {
          return (
            (g | getConsonant(selectedGrapheme)) ===
            getConsonant(selectedGrapheme)
          );
        } else {
          return g === getConsonant(selectedGrapheme);
        }
      } else return true;
    });
  } else return allConsonantGlyphs;
};

export const calcFilteredGraphemes = (
  {
    vowelFilter,
    consonantFilter,
    reverseSyllableFilter,
    partial,
    exclusive,
    selectedWord,
    glyphFilterDirection,
    wordFilterDirection,
  }: Pick<
    SelectionState,
    | "vowelFilter"
    | "consonantFilter"
    | "reverseSyllableFilter"
    | "partial"
    | "exclusive"
    | "selectedWord"
    | "glyphFilterDirection"
    | "wordFilterDirection"
  >,
  graphemes: Grapheme[] | undefined,
  words: Word[] | undefined
): Grapheme[] => {
  if (!graphemes || !words) return [];
  if (glyphFilterDirection === "right") {
    return graphemes.filter((gd) => {
      const { matchesVowel, matchesConsonant, reverseSyllablePass } =
        graphemeMatchesFilters(
          gd.id,
          vowelFilter,
          consonantFilter,
          reverseSyllableFilter,
          partial
        );
      return getTotalPassValue(
        vowelFilter,
        consonantFilter,
        matchesVowel,
        matchesConsonant,
        reverseSyllablePass,
        exclusive
      );
    });
  } else if (wordFilterDirection === "left" && selectedWord != null) {
    return graphemes.filter((gd) =>
      words
        .find((w) => w.id === selectedWord)
        ?.glyphs.includes(gd.id.toString())
    );
  }
  return graphemes;
};

const wordContainsNGram = (word: string[], nGram: string[]): boolean => {
  const n = nGram.length;
  for (let i = 0; i < word.length - (n - 1); i++) {
    const nGramSlice = word.slice(i, i + n);
    if (isEqual(nGramSlice, nGram)) {
      return true;
    }
  }
  return false;
};

export const calcFilteredNGrams = (
  {
    vowelFilter,
    consonantFilter,
    reverseSyllableFilter,
    partial,
    exclusive,
    n,
    selectedWord,
    glyphFilterDirection,
    wordFilterDirection,
  }: Pick<
    SelectionState,
    | "vowelFilter"
    | "consonantFilter"
    | "reverseSyllableFilter"
    | "partial"
    | "exclusive"
    | "n"
    | "selectedWord"
    | "glyphFilterDirection"
    | "wordFilterDirection"
  >,
  words: Word[] | undefined
): string[][] => {
  if (!words) return [];
  const filteredNGrams = {} as Record<
    string,
    { count: number; ngram: string[] }
  >;

  for (const w of words) {
    for (let i = 0; i < w.glyphs.length - (n - 1); i++) {
      const nGramSlice = w.glyphs.slice(i, i + n);
      let nGramMatches = true;
      if (glyphFilterDirection === "right") {
        const results = nGramSlice.map((g) =>
          graphemeMatchesFilters(
            parseInt(g),
            vowelFilter,
            consonantFilter,
            reverseSyllableFilter,
            partial
          )
        );
        const reverseSyllablePassExists = results.some(
          (r) => r.reverseSyllablePass
        );
        const consonantMatchExists = results.some((r) => r.matchesConsonant);
        const vowelMatchExists = results.some((r) => r.matchesVowel);
        nGramMatches = getTotalPassValue(
          vowelFilter,
          consonantFilter,
          vowelMatchExists,
          consonantMatchExists,
          reverseSyllablePassExists,
          exclusive
        );
      } else if (wordFilterDirection === "left" && selectedWord != null) {
        const selectedWordData = words.find((w) => w.id === selectedWord);
        if (selectedWordData)
          nGramMatches = wordContainsNGram(selectedWordData.glyphs, nGramSlice);
      }
      if (nGramMatches) {
        const id = nGramSlice.join("_");
        if (!has(filteredNGrams, id)) {
          filteredNGrams[id] = { count: 1, ngram: nGramSlice };
        } else {
          filteredNGrams[id].count++;
        }
      }
    }
  }

  return Object.values(filteredNGrams)
    .map((ng) => ng.ngram)
    .sort(
      (a, b) =>
        filteredNGrams[b.join("_")].count - filteredNGrams[a.join("_")].count
    );
};

export const calcFilteredWords = (
  {
    selectedGrapheme,
    selectedNGram,
    selectedContext,
    mode,
    graphemeFilterDirection,
    contextFilterDirection,
  }: Pick<
    SelectionState,
    | "selectedGrapheme"
    | "selectedNGram"
    | "selectedContext"
    | "mode"
    | "graphemeFilterDirection"
    | "contextFilterDirection"
  >,
  words: Word[] | undefined,
  contexts: Context[] | undefined
): Word[] => {
  if (!words) return [];
  if (contextFilterDirection === "left" && selectedContext) {
    const ctx = contexts?.find((c) => c.id === selectedContext);
    if (!ctx) return words;
    return ctx.words.reduce((acc, word) => {
      const existingWord = words.find((w) => w.id === word);
      if (existingWord) acc.push(existingWord);
      return acc;
    }, [] as Word[]);
  } else if (graphemeFilterDirection === "right") {
    if (mode === "graphemes" && selectedGrapheme) {
      return words.filter((w) =>
        w.glyphs.includes(selectedGrapheme.toString())
      );
    } else if (mode === "ngrams" && selectedNGram) {
      return words.filter((w) => wordContainsNGram(w.glyphs, selectedNGram));
    }
  }
  return words;
};
