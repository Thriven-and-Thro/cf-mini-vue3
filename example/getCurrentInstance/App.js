import {
  h,
  createTextVNode,
  getCurrentInstance,
} from "../../lib/cf-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    // h函数的children数组成员需都为h函数
    return h("div", {}, [
      createTextVNode("App:" + this.instance.type.name),
      h(Foo),
    ]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log(instance);

    return {
      instance,
    };
  },
};
