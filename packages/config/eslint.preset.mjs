// Atlas shared ESLint flat-config preset (docs/CODING_STANDARDS.md).
// typescript-eslint "strict" is the non-type-checked strict tier; the
// type-checked tier is deferred until real source lands (needs project refs).
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
);
