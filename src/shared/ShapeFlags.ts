// 节点类型
export const enum ShapeFlags {
  // 使用二进制代表类型提高性能
  // 通过 | 修改
  // 通过 & 查找

  ELEMENT = 1, // 0001
  STATEFUL_COMPONENT = 1 << 1, // 0010
  TEXT_CHILDREN = 1 << 2, // 0100
  ARRAY_CHILDREN = 1 << 3, // 1000
}
