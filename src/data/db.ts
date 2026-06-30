import { Dexie, type EntityTable, type Table } from "dexie";

export interface Trune {
  id: number;
  derived: boolean;
  meaning?: string;
}

export interface Word {
  id: number;
  truneIds: number[];
  meaning?: string;
}

export interface Context {
  id: number;
  imageId?: number;
  text?: string;
  wordIds: number[];
}

export interface Image {
  id: number;
  blob: Blob;
}

export type SubsetColor = "magenta" | "blue" | "green" | "orange" | "purple";

export interface GlyphSubset {
  id: number;
  name: string;
  mask: number;
  color?: SubsetColor;
  modifier: boolean;
  rule?: string;
}

export const db = new Dexie("tunic") as Dexie & {
  trunes: Table<Trune, number>;
  words: EntityTable<Word, "id">;
  contexts: EntityTable<Context, "id">;
  images: EntityTable<Image, "id">;
  glyphSubsets: EntityTable<GlyphSubset, "id">;
};

db.version(1).stores({
  graphemes: "id",
  words: "++id, &glyphs",
  contexts: "++id, imageId, *words",
  images: "++id",
});

db.version(2)
  .stores({
    trunes: "id",
    graphemes: null,
  })
  .upgrade(async (tx) => {
    const old = await tx.table<Trune, number>("graphemes").toArray();
    if (old.length) await tx.table<Trune, number>("trunes").bulkPut(old);
  });

db.version(3).stores({
  groups: "++id",
  modifiers: "++id",
});

db.version(4)
  .stores({
    glyphSubsets: "++id",
    groups: null,
    modifiers: null,
  })
  .upgrade(async (tx) => {
    const old = await tx
      .table<{
        id: number;
        name: string;
        mask: number;
        color?: SubsetColor;
      }>("groups")
      .toArray();
    if (old.length) {
      await tx
        .table<GlyphSubset, number>("glyphSubsets")
        .bulkPut(old.map((g) => ({ ...g, modifier: false })));
    }
  });

db.version(5).stores({
  words: "++id, *glyphs",
});

db.version(6)
  .stores({
    words: "++id, *trunes",
  })
  .upgrade(async (tx) => {
    await tx
      .table("words")
      .toCollection()
      .modify((w: { glyphs?: string[]; trunes?: number[] }) => {
        if (w.glyphs) {
          w.trunes = w.glyphs.map(Number);
          delete w.glyphs;
        }
      });
  });

db.version(7).upgrade(async (tx) => {
  const words = await tx.table("words").toArray();
  const organic = new Set<number>();
  for (const w of words as { trunes?: number[] }[]) {
    for (const t of w.trunes ?? []) organic.add(t);
  }
  await tx
    .table("trunes")
    .toCollection()
    .modify((t: { id: number; derived?: boolean }) => {
      t.derived = !organic.has(t.id);
    });
});

db.version(8)
  .stores({
    words: "++id, *truneIds",
    contexts: "++id, imageId, *wordIds",
  })
  .upgrade(async (tx) => {
    await tx
      .table("words")
      .toCollection()
      .modify((w: { trunes?: number[]; truneIds?: number[] }) => {
        if (w.trunes && !w.truneIds) {
          w.truneIds = w.trunes;
          delete w.trunes;
        }
      });
    await tx
      .table("contexts")
      .toCollection()
      .modify((c: { words?: number[]; wordIds?: number[] }) => {
        if (c.words && !c.wordIds) {
          c.wordIds = c.words;
          delete c.words;
        }
      });
  });

export default db;
