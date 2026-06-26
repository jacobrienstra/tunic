import {
  BaseQueryFn,
  FetchBaseQueryError,
  TagDescription,
  createApi,
} from "@reduxjs/toolkit/query/react";

import { Context, ContextWordJoin, Grapheme, Word, db } from "../../db";

export type { Context, ContextWordJoin, Grapheme, Word };

const dexieBaseQuery =
  (): BaseQueryFn<() => Promise<unknown>, unknown, unknown> =>
  async (requestFn) => {
    try {
      return { data: await requestFn() };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };

export const dataApi = createApi({
  reducerPath: "data",
  baseQuery: dexieBaseQuery(),
  tagTypes: ["Graphemes", "Words", "Contexts", "ContextWordJoins"],
  endpoints: (builder) => ({
    getGraphemes: builder.query<Grapheme[] | undefined, void>({
      query: () => async () => db.graphemes.toArray(),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Graphemes" as const, id })),
              "Graphemes",
            ]
          : ["Graphemes"],
    }),
    getWords: builder.query<Word[] | undefined, void>({
      query: () => async () => db.words.toArray(),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Words" as const, id })),
              "Words",
            ]
          : ["Words"],
    }),
    getContexts: builder.query<Context[] | undefined, void>({
      query: () => async () => db.contexts.toArray(),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Contexts" as const, id })),
              "Contexts",
            ]
          : ["Contexts"],
    }),
    getContextWordJoins: builder.query<ContextWordJoin[] | undefined, void>({
      query: () => async () => db.contextWordJoins.toArray(),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ContextWordJoins" as const,
                id,
              })),
              "ContextWordJoins",
            ]
          : ["ContextWordJoins"],
    }),
    getGraphemeById: builder.query<Grapheme | undefined, number>({
      query: (id) => async () => db.graphemes.get(id),
      providesTags: (result) =>
        result ? [{ type: "Graphemes", id: result.id }] : [],
    }),
    getWordById: builder.query<Word | undefined, number>({
      query: (id) => async () => db.words.get(id),
      providesTags: (result) =>
        result ? [{ type: "Words", id: result.id }] : [],
    }),
    getContextById: builder.query<Context | undefined, number>({
      query: (id) => async () => db.contexts.get(id),
      providesTags: (result) =>
        result ? [{ type: "Contexts", id: result.id }] : [],
    }),
    updateGrapheme: builder.mutation<
      Grapheme | undefined,
      { id: number } & Partial<Grapheme>
    >({
      query:
        ({ id, meaning = "" }) =>
        async () => {
          const existing = await db.graphemes.get(id);
          const next: Grapheme = {
            id,
            meaning: meaning ?? existing?.meaning ?? "",
          };
          await db.graphemes.put(next);
          return next;
        },
      invalidatesTags: (result) =>
        result ? [{ type: "Graphemes", id: result.id }] : [],
    }),
    updateWord: builder.mutation<
      Word | undefined,
      { id: number } & Partial<Word>
    >({
      query:
        ({ id, ...patch }) =>
        async () => {
          await db.words.update(id, patch);
          return db.words.get(id);
        },
      invalidatesTags: (result) =>
        result ? [{ type: "Words", id: result.id }] : [],
    }),
    updateContext: builder.mutation<
      Context | undefined,
      { id: number } & Partial<Context>
    >({
      query:
        ({ id, ...patch }) =>
        async () => {
          await db.contexts.update(id, patch);
          return db.contexts.get(id);
        },
      invalidatesTags: (result) =>
        result ? [{ type: "Contexts", id: result.id }] : [],
    }),
    upsertContext: builder.mutation<Context | undefined, { imageId?: number }>({
      queryFn: async ({ imageId }) => {
        try {
          const existing = await db.transaction("rw", db.contexts, async () => {
            const found =
              imageId != null
                ? await db.contexts.where("imageId").equals(imageId).first()
                : await db.contexts.filter((c) => c.imageId == null).first();
            if (found) return found;
            const id = await db.contexts.add({
              imageId,
              text: "",
            });
            return (await db.contexts.get(id))!;
          });
          return { data: existing };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : String(error),
            } as unknown as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: (result) =>
        result ? [{ type: "Contexts", id: result.id }] : [],
    }),
    addWord: builder.mutation<
      | {
          wordId: number;
          graphemeIds: number[];
          contextId: number;
          contextWordJoinId: number;
        }
      | undefined,
      { word: number[]; ctxId: number; order?: number }
    >({
      queryFn: async ({ word, ctxId, order }) => {
        try {
          const result = await db.transaction(
            "rw",
            [db.words, db.contextWordJoins, db.graphemes],
            async () => {
              const glyphs = word.map(String);
              let existingWord = await db.words
                .where("glyphs")
                .equals(glyphs)
                .first();
              if (!existingWord) {
                const wordId = await db.words.add({
                  glyphs,
                  meaning: "",
                });
                existingWord = (await db.words.get(wordId))!;
              }

              const joinId = await db.contextWordJoins.add({
                contextId: ctxId,
                wordId: existingWord.id,
                order: order ?? 0,
              });

              for (const grapheme of word) {
                const existing = await db.graphemes.get(grapheme);
                if (!existing) {
                  await db.graphemes.put({ id: grapheme, meaning: "" });
                }
              }

              return {
                wordId: existingWord.id,
                contextId: ctxId,
                graphemeIds: word,
                contextWordJoinId: joinId,
              };
            }
          );
          return { data: result };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : String(error),
            } as unknown as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: (result) =>
        result
          ? (
              [
                "Words",
                "Contexts",
                "Graphemes",
                "ContextWordJoins",
                { type: "Words" as const, id: result.wordId },
                { type: "Contexts" as const, id: result.contextId },
                {
                  type: "ContextWordJoins" as const,
                  id: result.contextWordJoinId,
                },
              ] as TagDescription<
                "Graphemes" | "Words" | "Contexts" | "ContextWordJoins"
              >[]
            ).concat(
              result.graphemeIds.map((id) => ({
                type: "Graphemes" as const,
                id: id,
              }))
            )
          : [],
    }),
  }),
});

export const {
  useGetGraphemesQuery,
  useGetWordsQuery,
  useGetContextsQuery,
  useGetContextWordJoinsQuery,
  useGetGraphemeByIdQuery,
  useGetWordByIdQuery,
  useGetContextByIdQuery,
  useUpdateGraphemeMutation,
  useUpdateWordMutation,
  useUpdateContextMutation,
  useUpsertContextMutation,
  useAddWordMutation,
} = dataApi;
export default dataApi;
