import {
  createDirectus,
  createItem,
  readItem,
  readItems,
  rest,
  updateItem,
} from "@directus/sdk";

const converter = (val: number) => {
  let newVal = 0;
  if (val & (1 << 0)) {
    newVal |= 1 << 5;
  }
  if (val & (1 << 1)) {
    newVal |= 1 << 6;
  }
  if (val & (1 << 2)) {
    newVal |= 1 << 8;
  }
  if (val & (1 << 3)) {
    newVal |= 1 << 9;
  }
  if (val & (1 << 4)) {
    newVal |= 1 << 7;
  }
  if (val & (1 << 5)) {
    newVal |= 1 << 11;
  }
  if (val & (1 << 6)) {
    newVal |= 1 << 0;
  }
  if (val & (1 << 7)) {
    newVal |= 1 << 1;
  }
  if (val & (1 << 8)) {
    newVal |= 1 << 3;
  }
  if (val & (1 << 9)) {
    newVal |= 1 << 4;
  }
  if (val & (1 << 10)) {
    newVal |= 1 << 2;
  }
  if (val & (1 << 12)) {
    newVal |= 1 << 10;
  }
  return newVal;
};

export const sdk = createDirectus<any>("http://localhost:8055").with(rest());

const words = await sdk.request(readItems("words", { limit: -1 }));

for (const word of words) {
  await sdk.request(
    updateItem("words", word.id, {
      glyphs: word.word.map((str: string) =>
        converter(parseInt(str)).toString()
      ),
    })
  );
}
