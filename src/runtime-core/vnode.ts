import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    // 节点类型
    shapeFalge: getShapFlag(type),
  };

  if (typeof children === "string") {
    vnode.shapeFalge |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFalge |= ShapeFlags.ARRAY_CHILDREN;
  }

  return vnode;
}

function getShapFlag(type): number {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
