/** @type {import('stylelint').Config} */

export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-tailwindcss",
    "stylelint-config-idiomatic-order",
  ],
  plugins: ["stylelint-order"],
  overrides: [
    {
      files: ["**/*.{jsx,tsx}"],
      customSyntax: "postcss-jsx",
    },
  ],
  rules: {
    "declaration-empty-line-before": null,
    "selector-max-compound-selectors": null,
  },
};
