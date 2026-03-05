import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { fixupPluginRules } from "@eslint/compat";

const eslintConfig = [
  // Ignore build outputs and dependencies
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "Products/**",
      "public/**",
    ],
  },

  // TypeScript + Next.js rules for source files
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@next/next": fixupPluginRules(nextPlugin),
      "@typescript-eslint": tsPlugin,
      "react-hooks": fixupPluginRules(reactHooksPlugin),
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Next.js recommended rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // React hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Relaxed rules for this project
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    },
  },

  // JavaScript / config files
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      "@next/next": fixupPluginRules(nextPlugin),
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
];

export default eslintConfig;
