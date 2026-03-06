import { defineConfig } from "eslint/config";
import tseslint from "@electron-toolkit/eslint-config-ts";
import eslintConfigPrettier from "@electron-toolkit/eslint-config-prettier";
import eslintPluginSvelte from "eslint-plugin-svelte";

export default defineConfig(
  { ignores: ["**/node_modules", "**/dist", "**/out"] },
  tseslint.configs.recommended,
  eslintPluginSvelte.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parsers
      }
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off"
    }
  },
  {
    files: ["**/*.{tsx,svelte}"],
    rules: {
      "svelte/no-unused-svelte-ignore": "off"
    }
  },
  {
    files: ["tests/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  eslintConfigPrettier
);
