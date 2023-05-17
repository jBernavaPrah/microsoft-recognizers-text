module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    plugins: ['@typescript-eslint', 'only-warn'],
    extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
            impliedStrict: true,
        },
    },
    rules: {
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
        //'eqeqeq': ['error', 'smart'],
        //'radix': 'error',
        //'no-var': 'error',
        //'one-var': ['error', { var: 'never', let: 'never', const: 'never' }],
        //'curly': ['error'],
        //'spaced-comment': ['warn', 'always'],
        //'semi': 'error',
        //'brace-style': ['error', 'stroustrup'],
        //'indent': ['error', 4],
    },
};
