import { ref, h } from "../../lib/cf-mini-vue.esm.js";

const prev = h("div", {}, "oldText");
const next = h("div", {}, [h("div", {}, "newArray")]);

export const TextToArray = {
  render() {
    return this.change ? prev : next;
  },
  setup() {
    let change = ref(true);
    // 通过控制台除非更新
    window.change = change;

    return {
      change,
    };
  },
};