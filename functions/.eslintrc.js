module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'google',
  ],
  rules: {
    // Disable requiring JSDoc comments
    'require-jsdoc': 'off',
    // Allow both single and double quotes
    'quotes': 'off',
    // Relax max-len to 140 characters, ignoring URLs
    'max-len': ['error', {code: 140, ignoreUrls: true}],
    // Allow console.log for debugging in functions
    'no-console': 'off',
    // Ensure a newline at the end of files
    'eol-last': ['error', 'always'],
  },
  parserOptions: {
    ecmaVersion: 2020, // Allows for modern JS features like optional chaining, nullish coalescing
  },
};
