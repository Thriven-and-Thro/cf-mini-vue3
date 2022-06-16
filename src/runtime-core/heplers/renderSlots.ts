import { h } from "../index";

// 使用插槽函数：从slots中取值
export function renderSlots(slots, name = "default", props = {}) {
  const slot = slots[name];

  if (slot) {
    if (typeof slot === "function") {
      return h("div", {}, slot(props));
    }
  }
}
