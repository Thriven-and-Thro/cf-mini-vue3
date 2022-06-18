import { h, getCurrentInstance } from "../../lib/cf-mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  render() {
    return h("div", {}, "Foo:" + this.instance.type.name);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log(instance);

    return {
      instance,
    };
  },
};
