import { h } from "../../lib/cf-mini-vue.esm.js";

export const App = {
  render() {
    // ui
    return h("div", "hi,");
  },

  setup() {
    // 逻辑
    return {
      msg: "mini-vue",
    };
  },
};
