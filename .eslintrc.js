module.exports = {
    "parserOptions": {
      "ecmaVersion": 2017,
      "sourceType": "module"
    },
    "env": {
		  "node": true,
		  "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "rules": {

        "no-console": ["off"],
        "no-constant-condition": ["warn"],
        "no-template-curly-in-string": ["warn"],
        
        //"curly": ["warn","all"],
        "dot-location": ["warn","property"],
        "eqeqeq":["error","always"],
        "no-else-return": ["error", { "allowElseIf": true }],
        "no-extend-native": ["error"],
        "no-implicit-globals": ["warn"],
        "no-implied-eval": ["warn"],
        "no-invalid-this": ["error"],
        "no-lone-blocks": ["warn"],
        "no-loop-func": ["error"],
        "no-multi-spaces": ["error", {"exceptions": {"Property": true, "BinaryExpression": true, "VariableDeclarator": true, "ImportDeclaration": true}}],
        "no-multi-str": ["error"],
        "no-new": ["warn"],
        "no-new-wrappers": ["error"],
        "no-octal-escape": ["error"],
        "no-param-reassign": ["warn"],
        "no-return-assign": ["warn"],
        "no-unmodified-loop-condition": ["warn"],
        "no-unused-expressions": ["warn"],
        "no-useless-call": ["warn"],
        "no-useless-concat": ["warn"],
        "no-useless-escape": ["off"],
        "no-useless-return": ["warn"],
        "no-with": ["warn"],
        "radix": ["warn"],
        "require-await": ["warn"],
        "yoda": ["warn"],

        "no-restricted-globals": ["warn"],
        "no-shadow": ["warn"],
        "no-shadow-restricted-names": ["error"],
        "no-undef-init": ["error"],
        "no-undefined": ["warn"],
        "no-unused-vars": ["error", { "args": "none" }],
        "no-use-before-define": ["error"],

        "array-bracket-newline": ["error","consistent"],
        "array-bracket-spacing": ["error","never"],
        "block-spacing": ["error","never"],
        "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
        "comma-dangle": ["error", "always-multiline"],
        "comma-spacing": ["error", { "before": false, "after": true }],
        "comma-style": ["error", "last"],
        "computed-property-spacing": ["error", "never"],
        "consistent-this": ["warn", "self"],
        "eol-last": ["error", "always"],
        "func-call-spacing": ["error","never"],
        "func-name-matching": ["error","always",{"includeCommonJSModuleExports":false}],
        //"func-names": ["warn","as-needed"],
        "func-style": ["warn", "declaration" /*"expression"*/],
        "function-paren-newline": ["warn", "consistent"],
        "indent": ["error", "tab"],
        "key-spacing": ["error", {
            "singleLine":{
                "beforeColon":false,
                "afterColon":true,
                "mode":"strict",
            },
            "multiLine":{
                "beforeColon":false,
                "afterColon":true,
                "mode":"minimum",
                "align":"colon",
            }
        }],
        "keyword-spacing": ["error", {"before": false,"after": false}],
        "new-parens": ["error"],
        "newline-per-chained-call": ["warn", {"ignoreChainWithDepth":1}],
        "no-array-constructor": ["warn"],
        "no-lonely-if": ["warn"],
        "no-multiple-empty-lines": ["error",{"max":5,"maxBOF":0,"maxEOF":0}],
        "no-nested-ternary": ["error"],
        "no-new-object": ["warn"],
        "no-trailing-spaces": ["error",{"skipBlankLines": true}],
        "no-unneeded-ternary": ["error"],
        "no-whitespace-before-property": ["error"],
        "object-curly-newline": ["error",/*{"multiline": true}*/{ "consistent": true }],
        "object-curly-spacing": ["error", "never"],
        "object-property-newline": ["error"],
        //"one-var": ["warn"],//可読性のため、種類ごとに複数のまとまりに分けることがある
        "one-var-declaration-per-line": ["error", "initializations"],
        "operator-assignment": ["error", "always"],
        "operator-linebreak": ["error", "before", {"overrides": { "=": "after"}}],
        "padded-blocks": ["error", "never"],
        "quote-props": ["error", "consistent"],
        "quotes": ["error", "double", { "avoidEscape": true }],
        "semi": ["error", "always"],
        "semi-spacing": ["error", {"before": false, "after": true}],
        "semi-style": ["warn", "last"],
        "sort-keys": ["warn", "asc", {"caseSensitive": true, "natural": false}],
        "sort-vars": ["warn"],
        "space-before-blocks": ["error", { "functions": "never", "keywords": "never", "classes": "never" }],
        "space-before-function-paren": ["error", "never"],
        "space-in-parens": ["error", "never"],
        "space-infix-ops": ["error", {"int32Hint": false}],
        "space-unary-ops": ["error", {"words": true, "nonwords": false}],
        "template-tag-spacing": ["error", "never"],
        "unicode-bom": ["error", "never"],

        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "off",
            "windows"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};