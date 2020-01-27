module.exports = {
  plugins: ['@typescript-eslint', 'no-null'],
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    createDefaultProgram: true,
    project: './tsconfig.json'
  },
  extends: ['escapace'],
  rules: {
    'eslint-disable-next-line @typescript-eslint/require-await': 0,
    '@typescript-eslint/require-await': 0,
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
          requireLast: true
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false
        }
      }
    ]
  }
}
