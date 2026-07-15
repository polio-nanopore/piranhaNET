import { defineConfig } from "eslint/config";
import tseslint from "@electron-toolkit/eslint-config-ts";
import eslintPluginSvelte from "eslint-plugin-svelte";

export default defineConfig(
  { ignores: ["**/node_modules", "**/dist", "**/out", "**/shadcn"] },
  tseslint.configs.recommended,
  eslintPluginSvelte.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ["**/*.{tsx,svelte}"],
    rules: {
      "svelte/no-unused-svelte-ignore": "off",
    },
  },
  {
    files: ["**/tests/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
