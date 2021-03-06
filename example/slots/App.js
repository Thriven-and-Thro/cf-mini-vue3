import { h, createTextVNode } from "../../lib/cf-mini-vue.esm.js";
import { Foo1, Foo2 } from "./Foo.js";

// children为对象：传递插槽值
// 对象中的值为函数，且需返回节点

// Fragment
// createTextNode：因为children为数组时不能直接使用字符串，故文本需要文本节点
export const App = {
  setup() {},
  render() {
    return h("div", {}, [
      h(Foo1, {}, { default: ({ age }) => h("p", {}, "it is a slot " + age) }),
      h(
        Foo2,
        {},
        {
          header: () => [
            h("p", {}, "is header"),
            createTextVNode("is a text node"),
          ],
          footer: () => h("p", {}, "is footer"),
        }
      ),
    ]);
  },
};
