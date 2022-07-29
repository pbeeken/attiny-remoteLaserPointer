/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
    env: {
        'browser': true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        "plugin:prettier/recommended"
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
    },
    plugins: [
        '@typescript-eslint',
        'prettier'
    ],
    rules: {
        'prettier/prettier': 'warn'
    },
    root: true,
};
