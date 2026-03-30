// import prettierRecommend from "prettier/recommended";
import prettierConfig from "eslint-config-prettier";
import pluginRecommended from "eslint-plugin-prettier/recommended";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(pluginRecommended, prettierConfig, {
  rules: {
    "vue/v-on-event-hyphenation": ["error", "never"],
    "vue/attribute-hyphenation": ["error", "never"],

    "vue/no-multiple-template-root": "off",
    "vue/v-slot-style": "off",
    "vue/multi-word-component-names": "off",
    "vue/no-v-html": "off",
    "@typescript-eslint/no-duplicate-enum-values": "off",
    "vue/require-default-prop": "off"
  },
  ignores: ["node_modules", "public", "build", "dist"]
)
