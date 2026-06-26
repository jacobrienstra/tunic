import tseslint from "typescript-eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import eslint from "@eslint/js";

export default tseslint.config(
  {
    ignores: ["**/dist", "**/node_modules", "eslint.config.ts"],
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
      },
    },
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      importPlugin.flatConfigs.react,
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: {
            order: "desc",
            caseInsensitive: true,
          },
        },
      ],
      "import/extensions": [
        "error",
        "never",
        {
          css: "always",
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
    },
    extends: [
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat["jsx-runtime"],
      reactHooks.configs["recommended-latest"],
    ],
    rules: {
      "react/no-unknown-property": [
        "error",
        {
          ignore: ["css"],
        },
      ],
    },
  },
  {
    // disable type-aware linting on JS files
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  eslintPluginPrettierRecommended
);
