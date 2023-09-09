import {
  BaseQueryFn,
  FetchBaseQueryError,
  createApi,
} from "@reduxjs/toolkit/query/react";
import { isEmpty } from "lodash";
import type { AxiosError } from "axios";
import { HttpMethod, createDirectus, rest } from "@directus/sdk";
export const sdk = createDirectus("http://0.0.0.0:8055").with(rest());

const directusBaseQuery =
  (): BaseQueryFn<
    | string
    | {
        url: string;
        method: HttpMethod;
        body?: string | FormData;
        params?: Record<string, any>;
      },
    unknown,
    unknown
  > =>
  async (args) => {
    try {
      const result = await sdk.request(() => ({
        path: typeof args === "string" ? args : args.url,
        method: typeof args === "string" ? "GET" : args.method,
        body: typeof args === "string" ? undefined : args.body,
        params: typeof args === "string" ? undefined : args.params,
      }));
      return { data: (result as any).data };
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
    getGraphemes: builder.query<GraphemeData[], void>({
      query: () => "items/graphemes",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Graphemes" as const, id })),
              "Graphemes",
            ]
          : ["Graphemes"],
      transformResponse: (response: { data: GraphemeData[] }) => response?.data,
    }),
    getWords: builder.query<WordData[], void>({
      query: () => ({
        url: "items/words",
        method: "GET",
        params: { fields: ["*", "contexts.*"] },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Words" as const, id })),
              "Words",
            ]
          : ["Words"],
      transformResponse: (response: { data: WordData[] }) => response?.data,
    }),
    getContexts: builder.query<ContextData[], void>({
      query: () => "items/contexts",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Contexts" as const, id })),
              "Contexts",
            ]
          : ["Contexts"],
      transformResponse: (response: { data: ContextData[] }) => response?.data,
    }),
    getContextWordJunctions: builder.query<ContextWordJunction[], void>({
      query: () => "items/contexts_words",
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
      transformResponse: (response: { data: ContextWordJunction[] }) =>
        response?.data,
    }),
    getGraphemeById: builder.query<GraphemeData, number>({
      query: (id) => `items/graphemes/${id}`,
      transformResponse: (response: { data: GraphemeData }) => response?.data,
    }),
    getWordById: builder.query<WordData, number>({
      query: (id) => `items/words/${id}`,
      transformResponse: (response: { data: WordData }) => response?.data,
    }),
    getContextById: builder.query<ContextData, number>({
      query: (id) => `items/contexts/${id}`,
      transformResponse: (response: { data: ContextData }) => response?.data,
    }),
    getContextsForWord: builder.query<ContextData[], number>({
      query: (id) => ({
        url: `items/contexts`,
        method: "GET",
        params: { filter: { words: { words_id: { _eq: id } } } },
      }),
      transformResponse: (response: { data: ContextData[] }) => response?.data,
    }),
    updateGrapheme: builder.mutation<
      GraphemeData,
      { id: number } & Partial<GraphemeData>
    >({
      query: ({ ...body }) => ({
        url: "items/graphemes",
        method: "PATCH",
        ...body,
      }),
      transformResponse: (response: { data: GraphemeData }) => response?.data,
      invalidatesTags: (result) =>
        result ? [{ type: "Graphemes", id: result.id }] : [],
    }),
    updateWord: builder.mutation<WordData, { id: number } & Partial<WordData>>({
      query: ({ ...body }) => ({
        url: "items/words",
        method: "PATCH",
        ...body,
      }),
      transformResponse: (response: { data: WordData }) => response?.data,
      invalidatesTags: (result) =>
        result ? [{ type: "Words", id: result.id }] : [],
    }),
    updateContext: builder.mutation<
      ContextData,
      { id: number } & Partial<ContextData>
    >({
      query: ({ ...body }) => ({
        url: "items/contexts",
        method: "PATCH",
        ...body,
      }),
      transformResponse: (response: { data: ContextData }) => response?.data,
      invalidatesTags: (result) =>
        result ? [{ type: "Contexts", id: result.id }] : [],
    }),
    addWord: builder.mutation<
      {
        wordId: number;
        graphemeIds: number[];
        contextId: number;
        contextWordJunctionId: number;
      },
      { word: number[]; ctxImageId?: string }
    >({
      queryFn: async (
        { word, ctxImageId },
        _queryApi,
        _extraOptions,
        fetchWithBQ
      ) => {
        let existingWord = await fetchWithBQ({
          url: "items/words",
          method: "GET",
          params: { filter: { word: { _eq: word } } },
        });

        if (isEmpty(existingWord.data)) {
          existingWord = await fetchWithBQ({
            url: "items/words",
            method: "POST",
            body: JSON.stringify({ word }),
          });
        }
        if (!existingWord.data) {
          return { error: existingWord.error as FetchBaseQueryError };
        }

        let existingContext = await fetchWithBQ({
          url: "items/contexts",
          method: "GET",
          params: {
            filter: {
              image: { _eq: ctxImageId },
            },
          },
        });
        if (isEmpty(existingContext.data)) {
          existingContext = await fetchWithBQ({
            url: "items/contexts",
            method: "POST",
            body: ctxImageId ? JSON.stringify({ image: ctxImageId }) : "",
          });
        }

        if (!existingContext.data) {
          return { error: existingContext.error as FetchBaseQueryError };
        }

        const updatedJunction = await fetchWithBQ({
          url: "items/contexts_words",
          method: "POST",
          body: JSON.stringify({
            contexts_id: (existingContext.data as ContextData).id,
            words_id: (existingWord.data as WordData).id,
          }),
        });
        if (!updatedJunction.data) {
          return { error: updatedJunction.error as FetchBaseQueryError };
        }

        for (let grapheme of word) {
          let existingGrapheme = await fetchWithBQ({
            url: "items/graphemes",
            method: "GET",
            params: { filter: { id: { _eq: grapheme } } },
          });

          if (isEmpty(existingGrapheme.data)) {
            existingGrapheme = await fetchWithBQ({
              url: "items/graphemes",
              method: "POST",
              body: JSON.stringify({ id: grapheme }),
            });
          }
          if (!existingGrapheme.data) {
            return { error: existingGrapheme.error as FetchBaseQueryError };
          }
        }
        return {
          data: {
            wordId: (existingWord.data as WordData).id,
            contextId: (existingContext.data as ContextData).id,
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
  word: number[];
  contexts: [{ id: number; contexts_id: number; words_id: number }];
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
  useGetContextsForWordQuery,
  useUpdateGraphemeMutation,
  useUpdateWordMutation,
  useUpdateContextMutation,
  useAddWordMutation,
} = dataApi;
export default dataApi;
