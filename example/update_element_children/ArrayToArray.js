import { h, ref } from "../../lib/cf-mini-vue.esm.js";

// // 左侧删除
// // a,b,c
// const A = h("div", {}, [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ]);
// // a,b
// const B = h("div", {}, [h("div", { key: "a" }, "a")]);

// // 左侧增加
// // a,b
// const A = h("div", {}, [h("div", { key: "a" }, "a")]);
// // a,b,c
// const B = h("div", {}, [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ]);

// // 右侧删除
// // a,b,c
// const A = h("div", {}, [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ]);
// // b,c
// const B = h("div", {}, [h("div", { key: "c" }, "c")]);

// // 右侧增加
// // b,c
// const A = h("div", {}, [h("div", { key: "c" }, "c")]);
// // a,b,c
// const B = h("div", {}, [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ]);

// // 中间删除
// // a,b,c,e,g,d
// const A = h("div", {}, [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
//   h("div", { key: "e" }, "e"),
//   h("div", { key: "g" }, "g"),
//   h("div", { key: "d" }, "d"),
// ]);
// // a,b,e,f,d
// const B = h("div", {}, [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "e" }, "e"),
//   h("div", { key: "f" }, "f"),
//   h("div", { key: "d" }, "d"),
// ]);

// // 中间移位
// // a,b,c,d,e,f
// const A = h("div", {}, [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
//   h("div", { key: "d" }, "d"),
//   h("div", { key: "e" }, "e"),
//   h("div", { key: "f" }, "f"),
// ]);
// // a,b,e,c,d,f
// const B = h("div", {}, [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "e" }, "e"),
//   h("div", { key: "c" }, "c"),
//   h("div", { key: "d" }, "d"),
//   h("div", { key: "f" }, "f"),
// ]);

// 中间添加
// a,b,(c,d,e,z),f,g
// a,b,(d,c,y,e),f,g
const A = h("div", {}, [
  h("div", { key: "a" }, "a"),
  h("div", { key: "b" }, "b"),
  h("div", { key: "c" }, "c"),
  h("div", { key: "d" }, "d"),
  h("div", { key: "e" }, "e"),
  h("div", { key: "z" }, "z"),
  h("div", { key: "f" }, "f"),
  h("div", { key: "g" }, "g"),
]);
// a,b,e,c,d,f
const B = h("div", {}, [
  h("div", { key: "a" }, "a"),
  h("div", { key: "b" }, "b"),
  h("div", { key: "d" }, "d"),
  h("div", { key: "c" }, "c"),
  h("div", { key: "y" }, "y"),
  h("div", { key: "e" }, "e"),
  h("div", { key: "f" }, "f"),
  h("div", { key: "g" }, "g"),
]);
export const ArrayToArray = {
  render() {
    return this.change ? A : B;
  },

  setup() {
    const change = ref(true);
    window.change = change;

    return {
      change,
    };
  },
};
