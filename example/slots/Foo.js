import { h, renderSlots } from "../../lib/cf-mini-vue.esm.js";

// renderSlots使用插槽

export const Foo1 = {
  setup() {},
  render() {
    console.log(this);

    return h("div", {}, [
      renderSlots(this.$slots, "default", { age: 1 }),
      // 处理多子节点
      // renderSlots(this.$slots, "default"),
    ]);
  },
};

export const Foo2 = {
  setup() {},
  render() {
    console.log(this);

    return h("div", {}, [
      // 具名插槽
      h("div", {}, [
        renderSlots(this.$slots, "header"),
        Foo1,
        renderSlots(this.$slots, "footer"),
      ]),
    ]);
  },
};
