import { z } from "zod";
import {
  BasicIndex,
  createCollection,
  createLiveQueryCollection,
  useLiveQuery,
  eq,
  and,
  add,
  concat,
  toArray,
} from "@tanstack/react-db";
import {
  createBrowserWASQLitePersistence,
  openBrowserWASQLiteOPFSDatabase,
  persistedCollectionOptions,
} from "@tanstack/browser-db-sqlite-persistence";

// CONSTs
export const SUBSET_NAME_PATTERN =
  "^[a-zA-Z0-9_]([a-zA-Z0-9 _]*[a-zA-Z0-9_])?$";
export const SUBSET_NAME_RE = new RegExp(SUBSET_NAME_PATTERN);

export const SUBSET_COLORS = [
  "magenta",
  "blue",
  "green",
  "orange",
  "purple",
] as const;

export const SUBSET_COLOR_CLASSES: Record<
  (typeof SUBSET_COLORS)[number],
  string
> = {
  magenta: "[--subset-color:var(--color-pink-500)]",
  blue: "[--subset-color:var(--color-blue-500)]",
  green: "[--subset-color:var(--color-emerald-400)]",
  orange: "[--subset-color:var(--color-orange-400)]",
  purple: "[--subset-color:var(--color-purple-400)]",
};

export const WORD_KEY_SEP = "_";
export function wordKeyFromTruneIds(ids: number[]): string {
  return ids.join(WORD_KEY_SEP);
}
export function truneIdsFromWordKey(key: string): number[] {
  return key.split(WORD_KEY_SEP).map(Number);
}

export function getGrapheme(trune: number, mask: number) {
  return trune & mask;
}

// Tanstack DB Setup Functions
/*
 * One OPFS-backed SQLite database shared by every collection. wa-sqlite's
 * OPFSCoopSyncVFS uses a SQLITE_BUSY-retry scheme (no SharedArrayBuffer), so it
 * needs no COOP/COEP headers and runs on static hosts like GitHub Pages.
 * Opening the database is async, hence the top-level await.
 * */

const database = await openBrowserWASQLiteOPFSDatabase({
  databaseName: "tunic.sqlite",
});
const persistence = createBrowserWASQLitePersistence({ database });

// Bumping this on a local-only collection throws rather than auto-migrating.
const SCHEMA_VERSION = 1;

/*
 * Wraps persistedCollectionOptions + createCollection with a Zod schema. The
 * lone cast works around TanStack/db#1452: persistedCollectionOptions types the
 * returned `schema` as optional, but createCollection's schema overload needs
 * to be it required. The schema is present at runtime, so validation runs on
 * every write.
 * */

function persistedCollection<
  S extends z.ZodType<object, object>,
  TKey extends string | number,
>(opts: { id: string; schema: S; getKey: (item: z.output<S>) => TKey }) {
  const options = persistedCollectionOptions<z.output<S>, TKey, S>({
    ...opts,
    persistence,
    schemaVersion: SCHEMA_VERSION,
  });
  return createCollection({
    ...(options as Omit<typeof options, "schema">),
    defaultIndexType: BasicIndex,
  });
}

// Schemas and Collections

export const TruneSchema = z.object({
  id: z.number(),
  derived: z.boolean(),
  meaning: z.string().nullable(),
});
export type Trune = z.output<typeof TruneSchema>;
export const trunes = persistedCollection({
  id: "trunes",
  schema: TruneSchema,
  getKey: (t) => t.id,
});
trunes.createIndex((row) => row.id);

/*
 * A word's identity is its ordered trune ids joined with WORD_KEY_SEP
 * (e.g. "5_3_7"). Same trune sequence -> same id, so upsertWord is idempotent
 * and there are no homonyms. A word's trunes are immutable after creation;
 * their order lives in wordTrunesJunction, which drives the reactive truneIds
 * derivation below (the id string itself is not split in JS).
 * */

export const WordSchema = z.object({
  id: z.string(),
  meaning: z.string().nullable(),
});
export type Word = z.output<typeof WordSchema>;
export type WordWithTruneIds = Word & {
  truneIds: number[];
};

export function isWordWithTruneIds(r: unknown): r is WordWithTruneIds {
  return (
    typeof r === "object" &&
    r !== null &&
    "truneIds" in r &&
    Array.isArray((r as { truneIds: unknown }).truneIds)
  );
}

export const words = persistedCollection({
  id: "words",
  schema: WordSchema,
  getKey: (w) => w.id,
});
words.createIndex((row) => row.id);

export const WordTruneJunctionSchema = z.object({
  wordId: z.string(),
  order: z.number(),
  truneId: z.number(),
});
export type WordTruneJunction = z.output<typeof WordTruneJunctionSchema>;
export const wordTrunesJunction = persistedCollection({
  id: "wordTrunesJunction",
  schema: WordTruneJunctionSchema,
  getKey: (r) => `${r.wordId}:${r.order}`,
});
wordTrunesJunction.createIndex((row) => row.wordId);
wordTrunesJunction.createIndex((row) => row.truneId);

export const ContextSchema = z.object({
  id: z.uuid(),
  imageId: z.string(),
  text: z.string().nullable(),
  order: z.number(),
});
export type Context = z.output<typeof ContextSchema>;
export const contexts = persistedCollection({
  id: "contexts",
  schema: ContextSchema,
  getKey: (c) => c.id,
});
contexts.createIndex((row) => row.id);

export const GlyphSubsetSchema = z.object({
  id: z.uuid(),
  name: z.string().regex(SUBSET_NAME_RE),
  mask: z.number(),
  color: z.enum(SUBSET_COLORS),
  modifier: z.boolean(),
  rule: z.string().nullable(),
});
export type GlyphSubset = z.output<typeof GlyphSubsetSchema>;
export type SubsetColor = GlyphSubset["color"];
export const glyphSubsets = persistedCollection({
  id: "glyphSubsets",
  schema: GlyphSubsetSchema,
  getKey: (s) => s.id,
});

// context->words link; wordId references a word by its numeric id.
export const ContextWordJunctionSchema = z.object({
  contextId: z.uuid(),
  order: z.number(),
  wordId: z.string(),
});
export type ContextWordJunction = z.output<typeof ContextWordJunctionSchema>;

// Keyed "<contextId>:<order>", one row per ordered position.
export const contextWordsJunction = persistedCollection({
  id: "contextWordsJunction",
  schema: ContextWordJunctionSchema,
  getKey: (r) => `${r.contextId}:${r.order}`,
});
contextWordsJunction.createIndex((row) => row.contextId);
contextWordsJunction.createIndex((row) => row.wordId);

export const SETTINGS_KEY = "default";
export const SettingsSchema = z.object({
  id: z.string(),
  defaultSubsetRule: z.string(),
});
export type Settings = z.output<typeof SettingsSchema>;

export const settings = persistedCollection({
  id: "settings",
  schema: SettingsSchema,
  getKey: (s) => s.id,
});

// Live query collections
/*
 * Defined once; each is incrementally maintained by TanStack DB.
 * Components subscribe via the hooks below
 * so as not to recreate the query per component
 * */

export const allTrunes = createLiveQueryCollection((q) =>
  q.from({ t: trunes }).orderBy(({ t }) => t.id)
);

export const allTruneIds = createLiveQueryCollection((q) =>
  q
    .from({ t: trunes })
    .orderBy(({ t }) => t.id)
    .select(({ t }) => ({ id: t.id }))
);

export const wordsWithTruneIds = createLiveQueryCollection((q) =>
  q
    .from({ w: words })
    .orderBy(({ w }) => w.id)
    .select(({ w }) => ({
      ...w,
      truneIds: toArray(
        q
          .from({ j: wordTrunesJunction })
          .where(({ j }) => eq(j.wordId, w.id))
          .innerJoin({ t: trunes }, ({ j, t }) => eq(t.id, j.truneId))
          .orderBy(({ j }) => j.order)
          .select(({ t }) => t.id)
      ),
    }))
);

// One row per (word, starting position) for a fixed n-gram length. Built via
// n-1 self-joins of wordTrunesJunction on consecutive order offsets, so
// filtering by ngKey is a query
export const biGrams = createLiveQueryCollection((q) =>
  q
    .from({ j0: wordTrunesJunction })
    .innerJoin({ j1: wordTrunesJunction }, ({ j0, j1 }) =>
      eq(j1.wordId, j0.wordId)
    )
    .where(({ j0, j1 }) => eq(j1.order, add(j0.order, 1)))
    .select(({ j0, j1 }) => ({
      wordId: j0.wordId,
      position: j0.order,
      ngKey: concat(j0.truneId, WORD_KEY_SEP, j1.truneId),
    }))
);

export const triGrams = createLiveQueryCollection((q) =>
  q
    .from({ j0: wordTrunesJunction })
    .innerJoin({ j1: wordTrunesJunction }, ({ j0, j1 }) =>
      eq(j1.wordId, j0.wordId)
    )
    .innerJoin({ j2: wordTrunesJunction }, ({ j0, j2 }) =>
      eq(j2.wordId, j0.wordId)
    )
    .where(({ j0, j1, j2 }) =>
      and(eq(j1.order, add(j0.order, 1)), eq(j2.order, add(j0.order, 2)))
    )
    .select(({ j0, j1, j2 }) => ({
      wordId: j0.wordId,
      position: j0.order,
      ngKey: concat(
        j0.truneId,
        WORD_KEY_SEP,
        j1.truneId,
        WORD_KEY_SEP,
        j2.truneId
      ),
    }))
);

export const quadGrams = createLiveQueryCollection((q) =>
  q
    .from({ j0: wordTrunesJunction })
    .innerJoin({ j1: wordTrunesJunction }, ({ j0, j1 }) =>
      eq(j1.wordId, j0.wordId)
    )
    .innerJoin({ j2: wordTrunesJunction }, ({ j0, j2 }) =>
      eq(j2.wordId, j0.wordId)
    )
    .innerJoin({ j3: wordTrunesJunction }, ({ j0, j3 }) =>
      eq(j3.wordId, j0.wordId)
    )
    .where(({ j0, j1, j2, j3 }) =>
      and(
        eq(j1.order, add(j0.order, 1)),
        eq(j2.order, add(j0.order, 2)),
        eq(j3.order, add(j0.order, 3))
      )
    )
    .select(({ j0, j1, j2, j3 }) => ({
      wordId: j0.wordId,
      position: j0.order,
      ngKey: concat(
        j0.truneId,
        WORD_KEY_SEP,
        j1.truneId,
        WORD_KEY_SEP,
        j2.truneId,
        WORD_KEY_SEP,
        j3.truneId
      ),
    }))
);

export const NGRAM_COLLECTIONS = {
  2: biGrams,
  3: triGrams,
  4: quadGrams,
} as const;

export const contextsWithWords = createLiveQueryCollection((q) =>
  q
    .from({ c: contexts })
    .orderBy(({ c }) => c.order)
    .select(({ c }) => ({
      id: c.id,
      imageId: c.imageId,
      text: c.text,
      words: q
        .from({ j: contextWordsJunction })
        .where(({ j }) => eq(j.contextId, c.id))
        .orderBy(({ j }) => j.order)
        .select(({ j }) => j),
    }))
);

export const allContexts = createLiveQueryCollection((q) =>
  q.from({ c: contexts }).orderBy(({ c }) => c.order)
);

export const allGlyphSubsets = createLiveQueryCollection((q) =>
  q.from({ s: glyphSubsets }).orderBy(({ s }) => s.id)
);

export const allSettings = createLiveQueryCollection((q) =>
  q
    .from({ s: settings })
    .where(({ s }) => eq(s.id, SETTINGS_KEY))
    .findOne()
);

// Resuable hooks

export function useTrunes() {
  return useLiveQuery(allTrunes);
}

export function useTruneIds() {
  return useLiveQuery(allTruneIds);
}

export function useWords() {
  return useLiveQuery(wordsWithTruneIds);
}

export function useContexts() {
  return useLiveQuery(contextsWithWords);
}

export function useGlyphSubsets() {
  return useLiveQuery(allGlyphSubsets);
}
export type GlyphSubsetsCollection = ReturnType<
  typeof useGlyphSubsets
>["collection"];

export function useSettings() {
  return useLiveQuery(allSettings);
}

/* Block module resolution until every persisted collection has restored from
OPFS. Prevents derived queries (e.g. wordsWithTruneIds) from emitting rows
with empty child arrays during the window where one source has loaded but
its correlated junction/trunes hasn't. */
await Promise.all([
  trunes.preload(),
  words.preload(),
  wordTrunesJunction.preload(),
  contexts.preload(),
  contextWordsJunction.preload(),
  glyphSubsets.preload(),
  settings.preload(),
]);
