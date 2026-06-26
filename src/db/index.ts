import { useEffect, useState } from "react";
import { Dexie, type EntityTable, type Table } from "dexie";

export interface Grapheme {
  id: number;
  meaning: string;
}

export interface Word {
  id: number;
  glyphs: string[];
  meaning: string;
}

export interface Context {
  id: number;
  imageId?: number;
  text: string;
}

export interface ContextWordJoin {
  id: number;
  order: number;
  contextId: number;
  wordId: number;
}

export interface Image {
  id: number;
  blob: Blob;
}

export const db = new Dexie("tunic") as Dexie & {
  graphemes: Table<Grapheme, number>;
  words: EntityTable<Word, "id">;
  contexts: EntityTable<Context, "id">;
  contextWordJoins: EntityTable<ContextWordJoin, "id">;
  images: EntityTable<Image, "id">;
};

db.version(1).stores({
  graphemes: "id",
  words: "++id, &glyphs",
  contexts: "++id, imageId",
  contextWordJoins: "++id, contextId, wordId",
  images: "++id",
});

export function useDbImageUrl(imageId: number | null): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (imageId == null) {
      setUrl(undefined);
      return;
    }
    let objectUrl: string | undefined;
    let cancel = false;
    void db.images.get(imageId).then((rec) => {
      if (cancel || !rec) return;
      objectUrl = URL.createObjectURL(rec.blob);
      setUrl(objectUrl);
    });
    return () => {
      cancel = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  return url;
}

export default db;
