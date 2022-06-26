import { h, ref } from "../../lib/cf-mini-vue.esm.js";

export const App = {
  render() {
    return h("div", {}, [
      h("p", {}, this.count),
      h(
        "button",
        {
          onClick: this.click,
        },
        "点点我"
      ),
    ]);
  },

  setup() {
    const count = ref(0);
    const click = () => {
      count.value++;
    };

    return {
      count,
      click,
    };
  },
};
