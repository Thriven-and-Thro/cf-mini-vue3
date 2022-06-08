import { render } from "./render";
import { createVNode } from "./vnode";

// 传入根组件
export function createApp(rootComponent) {
  return {
    // 挂载到根容器
    mount(rootContainer) {
      // 所有节点都转为vnode再处理
      // rootComponent -> vnode
      const vnode = createVNode(rootComponent);

      render(vnode, rootContainer);
    },
  };
}
