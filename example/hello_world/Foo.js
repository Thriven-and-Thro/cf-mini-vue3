import { h } from "../../lib/cf-mini-vue.esm.js";

export const Foo = {
  setup(props) {
    console.log(props);
  },

  render() {
    return h("a", {}, "foo:" + this.foo);
  },
};
