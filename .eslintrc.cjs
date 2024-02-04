const fs = require('fs')
// import fs from 'fs'
// import prettierOptons from './.prettierrc'

const prettierOptions = JSON.parse(fs.readFileSync('./.prettierrc', 'utf8'))

module.exports = {
  // parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ['airbnb-base', 'prettier'],
  env: {
    es6: true,
    node: true,
    mongo: true,
    mocha: true,
  },
  rules: {
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'no-return-await': 'off',
    'prettier/prettier': [2, prettierOptions],
    'no-console': 'error',
    'func-names': ['warn'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'import/prefer-default-export': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['warn'],
    'no-param-reassign': 'off',
    'max-len': 'off',
    'linebreak-style': 'off',
    'no-nested-ternary': 'off',
    'no-unused-expressions': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['@configs', './configs'],
          ['@pkg', './packages'],
          ['@test', './test'],
          ['@utils', './src/utils'],
        ],
        extensions: ['.js', '.jsx', '.json'],
      },
    },
  },
  plugins: ['prettier', 'mocha'],
}
