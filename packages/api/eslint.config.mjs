import tseslint from "typescript-eslint";

export default tseslint.config({
  extends: [tseslint.configs.recommendedTypeChecked],
  files: ["**/*.ts"],
  languageOptions: {
    ecmaVersion: 2023,
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
  },
  ignores: ["dist/", "node_modules/", "*.js"],
});