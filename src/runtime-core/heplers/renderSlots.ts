import { createVNode } from "../vnode";

// 使用插槽函数：从$slots中取值
export function renderSlots(slots, name = "default", props = {}) {
  const slot = slots[name];

  if (slot) {
    if (typeof slot === "function") {
      return createVNode("div", {}, slot(props));
    }
  }
}
