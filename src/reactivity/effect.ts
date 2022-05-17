// 全局变量保存执行函数
let activiteEffect: ActiviteEffect;

// 封装执行函数
class ActiviteEffect {
  _fn: () => any;

  constructor(fn: () => any) {
    this._fn = fn;
  }

  run() {
    activiteEffect = this;
    this._fn();
  }
}

// 执行函数
export function effect(fn: () => any) {
  const activiteFn = new ActiviteEffect(fn);
  activiteFn.run();
}

type DepMap = Map<keyof any, Set<any>>;
type TargetMap = WeakMap<Object, DepMap>;

// proxy对象=》对象map
const targetMap: TargetMap = new WeakMap();
// 依赖收集
export function track(target: Object, key: keyof any) {
  let depMap = targetMap.get(target);
  if (!depMap) {
    // 对象属性=》函数依赖
    depMap = new Map();
    targetMap.set(target, depMap);
  }
  let effectSet = depMap.get(key);
  if (!effectSet) {
    // 函数依赖
    effectSet = new Set();
    depMap.set(key, effectSet);
  }
  effectSet.add(activiteEffect);
}

// 触发依赖
export function trigger(target: Object, key: keyof any) {
  let depMap = targetMap.get(target);
  let effectSet = depMap?.get(key);

  if (effectSet) {
    for (const effect of effectSet) {
      effect.run();
    }
  }
}
