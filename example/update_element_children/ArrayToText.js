import { ref, h } from "../../lib/cf-mini-vue.esm.js";

const prev = h("div", {}, [h("div", {}, "oldArray")]);
const next = h("div", {}, "newText");

export const ArrayToText = {
  render() {
    return this.change ? prev : next;
  },
  setup() {
    let change = ref(true);
    window.change = change;

    return {
      change,
    };
  },
};
