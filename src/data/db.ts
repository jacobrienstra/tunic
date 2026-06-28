import { Dexie, type EntityTable, type Table } from "dexie";

export interface Grapheme {
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
  graphemes: Table<Grapheme, number>;
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

export default db;
