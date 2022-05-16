import { track, trigger } from "./effect";

export function reactive<T extends Object>(target: T): T {
  return new Proxy(target, {
    get: (target, key, receiver) => {
      const res = Reflect.get(target, key, receiver);
      // 依赖收集
      track(target, key);
      return res;
    },
    set: (target, key, value, receiver) => {
      const res = Reflect.set(target, key, value, receiver);
      // 触发依赖
      trigger(target, key);
      return res;
    },
  });
}
