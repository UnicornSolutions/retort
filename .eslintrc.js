module.exports = {
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'eslint:recommended',
  ],
  plugins: ['@typescript-eslint', 'eslint-plugin-prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    // 0 = off; 1 = warning; 2 = error
    'no-unused-vars': 0, // Disabled due to bug. links to two bugs found below.
    // https://github.com/typescript-eslint/typescript-eslint/issues/363
    // https://github.com/typescript-eslint/typescript-eslint/issues/379
    'no-console': 2,
    'no-undef': 1,
    'no-extra-boolean-cast': 1,
    'require-atomic-updates': 0, // maybe turn this on when I understand it better
    '@typescript-eslint/explicit-member-accessibility': 0,
    indent: 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 0,
  },
  overrides: [
    {
      files: ['*.spec.ts'],
      rules: {
        'no-undef': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
      },
    },
  ],
};
