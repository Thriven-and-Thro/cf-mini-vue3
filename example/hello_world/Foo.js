import { h } from "../../lib/cf-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    console.log(props);

    const btn = () => {
      emit("btn", 1, 2);
      emit("other-btn", "a", "b");
    };

    return {
      btn,
    };
  },

  render() {
    return h(
      "button",
      {
        onClick: this.btn,
      },
      "foo:" + this.foo + this.$slots
    );
  },
};
