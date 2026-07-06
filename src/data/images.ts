import { useEffect, useState } from "react";
import { openDB, type IDBPDatabase } from "idb";
import { safeRandomUUID } from "@tanstack/react-db";

const DB_NAME = "tunic-images";
const STORE = "images";

let dbPromise: Promise<IDBPDatabase> | null = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE);
      },
    });
  }
  return dbPromise;
}

export async function saveImage(blob: Blob): Promise<string> {
  const db = await getDB();
  const id = safeRandomUUID();
  await db.put(STORE, blob, id);
  return id;
}

export async function getImage(id: string): Promise<Blob> {
  const db = await getDB();
  const blob = await db.get(STORE, id);
  if (!blob) throw new Error(`Image ${id} not found`);
  return blob as Blob;
}

export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

export function useImageUrl(imageId: string | null): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (imageId == null) {
      setUrl(undefined);
      return;
    }
    let cancelled = false;
    let objectUrl: string | undefined;
    void getImage(imageId).then((blob) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);
  return url;
}
