import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import baseConfig from "./base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.es2021, __DEV__: "readonly" } },
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.flat.recommended.rules },
  },
  {
    files: ["**/*.{js,cjs}"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];
