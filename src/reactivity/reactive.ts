import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

// 抽取：new proxy的重复操作
function createAvtiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactive<T extends Object>(target: T): T {
  return createAvtiveObject(target, mutableHandlers);
}

export function readonly<T extends Object>(target: T): T {
  return createAvtiveObject(target, readonlyHandlers);
}
