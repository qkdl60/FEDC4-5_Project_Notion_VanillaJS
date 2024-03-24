module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb-base",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    // TODO lint airbnb에서 이런 규칙을 만든 이유 공부하기 , 가능하다면  off 없애기
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "class-methods-use-this": "off",
    "no-console": "off",
    "no-prototype-builtins": "off",
    "no-unused-vars": "off",
    "import/prefer-default-export": "off",
    "consistent-return": "off",
    "no-return-await": "off",
  },
};
