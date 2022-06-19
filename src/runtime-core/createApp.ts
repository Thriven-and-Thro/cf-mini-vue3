// import { render } from "./renderer";
import { createVNode } from "./vnode";

// 定制化renderer后就没有直接暴露render，故需通过该函数传递render
export function createAppAPI(render) {
  // 传入根组件
  return function createApp(rootComponent) {
    return {
      // 挂载到根容器
      mount(rootContainer) {
        // 所有节点都转为vnode再处理
        // rootComponent -> vnode
        const vnode = createVNode(rootComponent);

        render(vnode, rootContainer, {});
      },
    };
  };
}
