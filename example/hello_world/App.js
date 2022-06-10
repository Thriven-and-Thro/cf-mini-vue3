import { h } from "../../lib/cf-mini-vue.esm.js";

export const App = {
  render() {
    // ui
    return h("div", { class: "root", id: 0 }, [
      h("p", { class: "green", id: 1 }, "hi"),
      h("p", { class: "red", id: 2 }, "min-vue"),
    ]);
  },

  setup() {
    // 逻辑
    return {
      msg: "mini-vue",
    };
  },
};
