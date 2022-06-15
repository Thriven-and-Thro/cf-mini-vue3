import { h } from "../../lib/cf-mini-vue.esm.js";
import { Foo } from "./Foo.js";

// test init element
// export const App = {
//   render() {
//     // ui
//     return h("div", { class: "root", id: 0 }, [
//       h("p", { class: "green", id: 1 }, "hi"),
//       h("p", { class: "red", id: 2 }, "min-vue"),
//     ]);
//   },

//   setup() {
//     // 逻辑
//     return {
//       msg: "mini-vue",
//     };
//   },
// };

// test $el
window.self = null;
export const App = {
  render() {
    window.self = this;
    // ui
    // test template
    return h("div", { class: "root", id: 0 }, [
      h(
        "p",
        {
          class: "green",
          id: 1,
          onClick: () => {
            console.log("click");
          },
          onMousedown: () => {
            console.log("mousedown");
          },
        },
        "hi"
      ),
      // test setupState
      h("p", { class: "red", id: 2 }, this.msg),
      h(Foo, {
        foo: 1,
        onBtn: this.onBtn,
        onOtherBtn: this.onOtherBtn,
      }),
    ]);
  },

  setup() {
    const onBtn = (a, b) => {
      console.log("onBtn", a, b);
    };
    const onOtherBtn = (a, b) => {
      console.log("onOtherBtn", a, b);
    };

    // 逻辑
    return {
      msg: "mini-vue",
      onBtn,
      onOtherBtn,
    };
  },
};
