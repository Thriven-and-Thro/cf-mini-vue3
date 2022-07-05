import { h, ref } from "../../lib/cf-mini-vue.esm.js";

export const App = {
  render() {
    return h("div", {}, [
      h("button", { onClick: this.click }, "点击更新组件"),
      h(Child, { appProps: this.appProps }),
      h(
        "button",
        {
          onClick: this.click2,
        },
        "点击更新元素"
      ),
      h("div", {}, this.count),
    ]);
  },

  setup() {
    const appProps = ref("组件");
    const click = () => {
      appProps.value = "更新";
    };

    const count = ref(0);
    const click2 = () => {
      count.value++;
    };

    return {
      appProps,
      click,
      count,
      click2,
    };
  },
};

export const Child = {
  render() {
    return h("div", {}, [h("p", {}, this.$props.appProps)]);
  },

  setup() {},
};
