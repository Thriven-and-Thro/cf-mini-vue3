import { h, ref } from "../../lib/cf-mini-vue.esm.js";

export const App = {
  render() {
    // 坑
    // 如果没有解构，为同一个引用
    // 故点击改变时，h函数内的也改变，就比较不出差别
    // return h("div", this.props, [
    return h("div", { ...this.props }, [
      h("p", {}, this.count),
      h(
        "button",
        {
          onClick: this.click,
        },
        "点点我"
      ),
      h("p", { style: "border-bottom: 1px solid #000" }, []),
      h(
        "button",
        {
          onClick: this.changePropsHandle,
        },
        "1. 改变值"
      ),
      h(
        "button",
        {
          onClick: this.setNullPropsHandle,
        },
        "2. 赋值为undefined或null"
      ),
      h(
        "button",
        {
          onClick: this.notHavePropsHandle,
        },
        "3. 新节点无该属性"
      ),
    ]);
  },

  setup() {
    const count = ref(0);
    const click = () => {
      count.value++;
    };

    const props = ref({
      foo: "foo",
      bar: "bar",
    });
    const changePropsHandle = () => {
      props.value.foo = "newFoo";
    };
    const setNullPropsHandle = () => {
      props.value.bar = null;
    };
    const notHavePropsHandle = () => {
      props.value = {
        foo: "foo",
      };
    };

    return {
      count,
      click,
      props,
      changePropsHandle,
      setNullPropsHandle,
      notHavePropsHandle,
    };
  },
};
