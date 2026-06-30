import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "./db";

export function useTrunes() {
  return useLiveQuery(() => db.trunes.toArray(), []);
}

export function useWords() {
  return useLiveQuery(() => db.words.toArray(), []);
}

export function useContexts() {
  return useLiveQuery(() => db.contexts.toArray(), []);
}

export function useContext(id: number | null | undefined) {
  return useLiveQuery(
    () => (id == null ? undefined : db.contexts.get(id)),
    [id]
  );
}

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
