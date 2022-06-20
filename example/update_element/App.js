import { h } from "../../lib/cf-mini-vue.esm";

export const App = {
  render() {
    return h("button", { onClick: this.click }, []);
  },
  setup() {
    const count = ref(0);
    const click = () => this.count++;

    return {
      count,
      click,
    };
  },
};
