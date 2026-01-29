import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Fichiers non-critiques
    "public/sw.js",
    "e2e/**",
    "**/*.test.ts",
    "**/*.spec.ts",
  ]),
  // Règles personnalisées - relaxer certaines contraintes
  {
    rules: {
      // Autoriser any avec warning (pas error)
      "@typescript-eslint/no-explicit-any": "warn",
      // Variables non utilisées : ignorer si préfixées par _
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      // Apostrophes dans JSX : warning seulement
      "react/no-unescaped-entities": "warn",
      // useEffect deps : warning (trop de faux positifs)
      "react-hooks/exhaustive-deps": "warn",
      // setState dans effect : warning
      "react-hooks/set-state-in-effect": "off",
    }
  }
]);

export default eslintConfig;
