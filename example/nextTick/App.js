import {
  getCurrentInstance,
  h,
  nextTick,
  ref,
} from "../../lib/cf-mini-vue.esm.js";

export const App = {
  render() {
    return h("div", {}, [
      h("button", { onClick: this.click }, "+100"),
      h("p", {}, this.count),
    ]);
  },

  setup() {
    const count = ref(0);
    const instance = getCurrentInstance();
    const click = () => {
      for (let i = 0; i < 100; i++) {
        count.value++;
      }
      console.log(instance);

      Promise.resolve().then(() => {
        console.log(instance);
      });

      nextTick(() => {
        console.log(instance);
      });
    };

    return {
      count,
      click,
    };
  },
};
