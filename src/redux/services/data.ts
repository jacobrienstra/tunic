import {
  BaseQueryFn,
  FetchBaseQueryError,
  createApi,
} from "@reduxjs/toolkit/query/react";
import { isEmpty } from "lodash";
import type { AxiosError } from "axios";
import {
  createDirectus,
  createItem,
  readItem,
  readItems,
  rest,
  updateItem,
} from "@directus/sdk";
export const sdk = createDirectus("http://localhost:8055").with(rest());

const directusBaseQuery =
  (): BaseQueryFn<() => Promise<object>, unknown, unknown> =>
  async (requestFn: () => Promise<object>) => {
    try {
      const result = await requestFn();
      return { data: result as any };
    } catch (error) {
      let err = error as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const dataApi = createApi({
  reducerPath: "data",
  baseQuery: directusBaseQuery(),
  tagTypes: ["Graphemes", "Words", "Contexts", "ContextWordJunction"],
  endpoints: (builder) => ({
    getGraphemes: builder.query<GraphemeData[] | undefined, void>({
      query: () => () => sdk.request(readItems("graphemes")),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Graphemes" as const, id })),
              "Graphemes",
            ]
          : ["Graphemes"],
      // transformResponse: (response: { data: GraphemeData[] }) => response?.data,
    }),
    getWords: builder.query<WordData[] | undefined, void>({
      query: () => () => sdk.request(readItems("words")),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Words" as const, id })),
              "Words",
            ]
          : ["Words"],
      // transformResponse: (response: { data: WordData[] }) => response?.data,
    }),
    getContexts: builder.query<ContextData[] | undefined, void>({
      query: () => () => sdk.request(readItems("contexts")),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Contexts" as const, id })),
              "Contexts",
            ]
          : ["Contexts"],
      // transformResponse: (response: { data: ContextData[] }) => response?.data,
    }),
    getContextWordJunctions: builder.query<
      ContextWordJunction[] | undefined,
      void
    >({
      query: () => () =>
        sdk.request(readItems("contexts_words", { sort: "order" })),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ContextWordJunction" as const,
                id,
              })),
              "ContextWordJunction",
            ]
          : ["ContextWordJunction"],
      // transformResponse: (response: { data: ContextWordJunction[] }) => response?.data,
    }),
    getGraphemeById: builder.query<GraphemeData | undefined, number>({
      query: (id) => () => sdk.request(readItem("graphemes", id)),
      providesTags: (result) =>
        result ? [{ type: "Graphemes", id: result.id }] : [],
      // transformResponse: (response: { data: GraphemeData }) => response?.data,
    }),
    getWordById: builder.query<WordData | undefined, number>({
      query: (id) => () => sdk.request(readItem("words", id)),
      providesTags: (result) =>
        result ? [{ type: "Words", id: result.id }] : [],
      // transformResponse: (response: { data: WordData }) => response?.data,
    }),
    getContextById: builder.query<ContextData | undefined, number>({
      query: (id) => () => sdk.request(readItem("contexts", id)),
      providesTags: (result) =>
        result ? [{ type: "Contexts", id: result.id }] : [],
      // transformResponse: (response: { data: ContextData }) => response?.data,
    }),
    updateGrapheme: builder.mutation<
      GraphemeData | undefined,
      { id: number } & Partial<GraphemeData>
    >({
      query:
        ({ id, ...rest }) =>
        () =>
          sdk.request(updateItem("graphemes", id, { ...rest })),
      // transformResponse: (response: { data: GraphemeData }) => response?.data,
      invalidatesTags: (result) =>
        result ? [{ type: "Graphemes", id: result.id }] : [],
    }),
    updateWord: builder.mutation<
      WordData | undefined,
      { id: number } & Partial<WordData>
    >({
      query:
        ({ id, ...rest }) =>
        () =>
          sdk.request(updateItem("words", id, { ...rest })),
      // transformResponse: (response: { data: WordData }) => response?.data,
      invalidatesTags: (result) =>
        result ? [{ type: "Words", id: result.id }] : [],
    }),
    updateContext: builder.mutation<
      ContextData | undefined,
      { id: number } & Partial<ContextData>
    >({
      query:
        ({ id, ...rest }) =>
        () =>
          sdk.request(updateItem("contexts", id, { ...rest })),
      // transformResponse: (response: { data: ContextData }) => response?.data,
      invalidatesTags: (result) =>
        result ? [{ type: "Contexts", id: result.id }] : [],
    }),
    addWord: builder.mutation<
      | {
          wordId: number;
          graphemeIds: number[];
          contextId: number;
          contextWordJunctionId: number;
        }
      | undefined,
      { word: number[]; ctxImageId?: string; order?: number }
    >({
      queryFn: async (
        { word, ctxImageId, order },
        _queryApi,
        _extraOptions,
        fetchWithBQ
      ) => {
        let existingWord: WordData | null = null;
        let result = await fetchWithBQ(() =>
          sdk.request(
            readItems("words", {
              filter: { word: { _eq: word.join(",") } },
            })
          )
        );

        if (!isEmpty(result.data)) {
          existingWord = (result.data as any[])[0];
        } else {
          result = await fetchWithBQ(() =>
            sdk.request(createItem("words", { word: word, meaning: "" }))
          );
          if (!result.data) {
            return { error: result.error as FetchBaseQueryError };
          } else {
            existingWord = result.data as WordData;
          }
        }

        let existingContext: ContextData | null = null;
        if (ctxImageId) {
          result = await fetchWithBQ(() =>
            sdk.request(
              readItems("contexts", {
                filter: {
                  image: { _eq: ctxImageId },
                },
              })
            )
          );
          if (!isEmpty(result.data)) {
            existingContext = (result.data as any[])[0];
          }
        } else {
          result = await fetchWithBQ(() =>
            sdk.request(
              readItems("contexts", {
                filter: {
                  image: { _null: true },
                },
              })
            )
          );
          if (!isEmpty(result.data)) {
            existingContext = (result.data as any[])[0];
          }
        }
        if (!existingContext) {
          result = await fetchWithBQ(() =>
            sdk.request(
              createItem("contexts", ctxImageId ? { image: ctxImageId } : {})
            )
          );
          if (!result.data) {
            return { error: result.error as FetchBaseQueryError };
          } else {
            existingContext = result.data as ContextData;
          }
        }

        const updatedJunction = await fetchWithBQ(() =>
          sdk.request(
            createItem("contexts_words", {
              contexts_id: (existingContext as ContextData).id,
              words_id: (existingWord as WordData).id,
              order: order,
            })
          )
        );
        if (!updatedJunction.data) {
          return { error: updatedJunction.error as FetchBaseQueryError };
        }

        for (let grapheme of word) {
          let existingGrapheme = await fetchWithBQ(() =>
            sdk.request(readItem("graphemes", grapheme))
          );

          if (isEmpty(existingGrapheme.data)) {
            existingGrapheme = await fetchWithBQ(() =>
              sdk.request(createItem("graphemes", { id: grapheme, sound: "" }))
            );
          }
          if (!existingGrapheme.data) {
            return { error: existingGrapheme.error as FetchBaseQueryError };
          }
        }
        return {
          data: {
            wordId: (existingWord as WordData).id,
            contextId: (existingContext as ContextData).id,
            graphemeIds: word,
            contextWordJunctionId: (updatedJunction.data as ContextWordJunction)
              .id,
          },
        };
      },
      invalidatesTags: (result) =>
        result
          ? (
              [
                "Words",
                "Contexts",
                "Graphemes",
                "ContextWordJunction",
                { type: "Words" as const, id: result.wordId },
                { type: "Contexts" as const, id: result.contextId },
                {
                  type: "ContextWordJunction" as const,
                  id: result.contextWordJunctionId,
                },
              ] as any[]
            ).concat(
              result.graphemeIds.map((id) => ({ type: "Graphemes", id: id }))
            )
          : [],
    }),
  }),
});

export interface ContextWordJunction {
  id: number;
  order: number;
  contexts_id: number;
  words_id: number;
}

export interface GraphemeData {
  id: number;
  sound: string;
}

export interface WordData {
  id: number;
  word: string[];
  contexts: number[];
  meaning: string;
}

export interface ContextData {
  id: number;
  image: string;
  words: number[];
  text: string;
}

export const {
  useGetGraphemesQuery,
  useGetWordsQuery,
  useGetContextsQuery,
  useGetContextWordJunctionsQuery,
  useGetGraphemeByIdQuery,
  useGetWordByIdQuery,
  useGetContextByIdQuery,
  useUpdateGraphemeMutation,
  useUpdateWordMutation,
  useUpdateContextMutation,
  useAddWordMutation,
} = dataApi;
export default dataApi;
