import {
  h,
  provide,
  inject,
  createTextVNode,
} from "../../lib/cf-mini-vue.esm.js";

// 开发思想：简单 =》复杂，小步骤开发，防止过度设计

export const App = {
  name: "App",
  render() {
    return h("div", {}, [h(Foo1), h(Foo3)]);
  },

  setup() {
    provide("thisName", "App");
  },
};

// 一层
const Foo1 = {
  name: "Foo1",
  render() {
    return h("h4", {}, [
      createTextVNode(
        `Foo1  this name: ${this.thisName} - last name: ${this.lastName}`
      ),
      h(Foo2),
    ]);
  },

  setup() {
    provide("lastName", "App");
    provide("thisName", "Foo1");

    const thisName = inject("thisName");
    const lastName = inject("lastName");

    return {
      thisName,
      lastName,
    };
  },
};

// 二层
const Foo2 = {
  name: "Foo2",
  render() {
    return h(
      "h5",
      {},
      `Foo2  this name: ${this.thisName} - last name: ${this.lastName}`
    );
  },

  setup() {
    provide("lastName", "Foo1");
    provide("thisName", "Foo2");

    const thisName = inject("thisName");
    const lastName = inject("lastName");

    return {
      thisName,
      lastName,
    };
  },
};

// 测试默认值
const Foo3 = {
  name: "Foo3",
  render() {
    return h(
      "h6",
      {},
      `Foo3  this name: ${this.thisName} - last name: ${this.lastName}`
    );
  },

  setup() {
    const thisName = inject("this", "normal default");
    const lastName = inject("last", () => "function default");

    return {
      thisName,
      lastName,
    };
  },
};
