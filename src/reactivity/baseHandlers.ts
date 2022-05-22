import { track, trigger } from "./effect";

// 优化：减少调用次数
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

// 抽取：proxy的get操作
function createGetter(isReadobnnly = false) {
  return (target, key, receiver) => {
    const res = Reflect.get(target, key, receiver);
    // 依赖收集
    if (!isReadobnnly) track(target, key);
    return res;
  };
}

// 抽取：proxy的set操作
function createSetter() {
  return (target, key, value, receiver) => {
    const res = Reflect.set(target, key, value, receiver);
    // 触发依赖
    trigger(target, key);
    return res;
  };
}

// 抽取：reactive的get、set操作
export const mutableHandlers = {
  get,
  set,
};

// 抽取：readonly的get、set操作
export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key, value, receiver) => {
    console.warn(`readonly的值不能被修改 ${String(key)}-${value}`);
    return true;
  },
};
