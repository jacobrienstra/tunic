import { Dexie, type EntityTable, type Table } from "dexie";

export interface Trune {
  id: number;
  meaning?: string;
}

export interface Word {
  id: number;
  glyphs: string[];
  meaning?: string;
}

export interface Context {
  id: number;
  imageId?: number;
  text?: string;
  words: number[];
}

export interface Image {
  id: number;
  blob: Blob;
}

export const db = new Dexie("tunic") as Dexie & {
  trunes: Table<Trune, number>;
  words: EntityTable<Word, "id">;
  contexts: EntityTable<Context, "id">;
  images: EntityTable<Image, "id">;
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

export default db;
