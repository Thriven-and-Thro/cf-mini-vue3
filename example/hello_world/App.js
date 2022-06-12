import { h } from "../../lib/cf-mini-vue.esm.js";

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

// test setupState $el event
window.self = null;
export const App = {
  render() {
    window.self = this;
    // ui
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
      h("p", { class: "red", id: 2 }, this.msg),
    ]);
  },

  setup() {
    // 逻辑
    return {
      msg: "mini-vue",
    };
  },
};
