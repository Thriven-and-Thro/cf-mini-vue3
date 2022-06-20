import { h, ref, Fragment } from "../../lib/cf-mini-vue.esm.js";

export const App = {
  render() {
    return h(Fragment, {}, [
      h("p", {}, this.count),
      h("button", { onClick: this.click }, "点点我"),
    ]);
  },
  setup() {
    const count = ref(0);
    const click = () => this.count++;

    return {
      count,
      click,
    };
  },
};
