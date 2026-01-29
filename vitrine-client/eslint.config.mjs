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
      // Variables non utilisées : warning au lieu d'error, ignorer si préfixées par _
      "@typescript-eslint/no-unused-vars": ["warn", {
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
      // Purity et immutability : warning au lieu d'error
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      // Next.js links : warning
      "@next/next/no-html-link-for-pages": "warn",
    }
  }
]);

export default eslintConfig;
