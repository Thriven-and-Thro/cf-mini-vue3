import {
  mutableHandler,
  readonlyHandler,
  shallowReadonlyHandler,
} from "./baseHandlers";

export const enum ReactiveFlag {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__V_isReadonly",
}

// 抽取：new proxy的重复操作
function createAvtiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactive<T extends Object>(target: T): T {
  return createAvtiveObject(target, mutableHandler);
}

export function readonly<T extends Object>(target: T): T {
  return createAvtiveObject(target, readonlyHandler);
}

export function shallowReadonly<T extends Object>(target: T): T {
  return createAvtiveObject(target, shallowReadonlyHandler);
}

// 通过读取值触发track操作来判断
export function isReactive(target: Object): boolean {
  // !!是为了当非proxy时取值undefined时也能返回boolean
  return !!target[ReactiveFlag.IS_REACTIVE];
}

export function isReadonly(target: Object): boolean {
  return !!target[ReactiveFlag.IS_READONLY];
}

export function isProxy(target: Object): boolean {
  return isReactive(target) || isReadonly(target);
}
