import js from "@eslint/js";
import globals from "globals";
import eslintReact from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";
import eslintReactRefresh from "eslint-plugin-react-refresh";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginHtml from "eslint-plugin-html";
import eslintConfigReactApp from "eslint-config-react-app";
import eslintAllyPlugin from "eslint-plugin-jsx-a11y";
import eslintImportPlugin from "eslint-plugin-import";

export default [
  {
    ignores: [
      "dist",
      "node_modules",
      "coverage",
      "eslint.config.js",
      "**/*.config.js",
    ],
  },
  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,

      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3.1" } },
    plugins: {
      react: eslintReact,
      "react-hooks": eslintReactHooks,
      "react-refresh": eslintReactRefresh,
      prettier: prettierPlugin,
      "eslint-plugin-html": eslintPluginHtml,
      "jsx-a11y": eslintAllyPlugin,
      "eslint-config-react-app": eslintConfigReactApp,
      import: eslintImportPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      ...eslintConfigPrettier.rules,

      semi: "error",
      "react/jsx-no-target-blank": "off",

      "prefer-const": "error",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
