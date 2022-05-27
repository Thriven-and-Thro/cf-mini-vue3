import { extend } from "../shared";

// 全局变量保存执行函数
let activiteEffect: ActiviteEffect;
// 防止重复get进行依赖收集
let shouldTrack: boolean = true;

// 封装执行函数
class ActiviteEffect {
  private _fn: () => any;
  // 适配器
  public scheduler?: () => any;
  // 反向依赖收集
  public deps: any[];
  private active: boolean;
  private onStop?: () => any;

  // 通过 public 暴露给外界使用
  constructor(fn: () => any) {
    this._fn = fn;
    this.deps = [];
    this.active = true;
  }

  run(): any {
    // 防止++操作使stop失效
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;

    activiteEffect = this;
    const result = this._fn();

    // 上锁
    shouldTrack = false;

    return result;
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
      return this.onStop && this.onStop();
    }
  }
}

function cleanupEffect(effect: ActiviteEffect) {
  effect.deps.forEach((dep: Set<any>) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

// 执行函数
export function effect(fn: () => any, option: any = {}): () => any {
  const activiteFn = new ActiviteEffect(fn);
  // 将Object.assign别名为extend，提高可读性
  extend(activiteFn, option);
  activiteFn.run();

  const runner: any = activiteFn.run.bind(activiteFn);
  // 将ActiviteEffect实例挂载到runner上，便于stop函数取到实例
  runner.effect = activiteFn;

  return runner;
}

// stop
export function stop(runner) {
  runner.effect.stop();
}

type DepMap = Map<keyof any, Set<any>>;
type TargetMap = WeakMap<Object, DepMap>;

// proxy对象=》对象map
const targetMap: TargetMap = new WeakMap();
// 依赖收集
export function track(target: Object, key: keyof any) {
  if (!isTracking()) return;

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

  trackEffect(effectSet);
}

// 抽离功能，因为ref不需要以上依赖的数据结构
export function trackEffect(effectSet: Set<any>) {
  effectSet.add(activiteEffect);
  // 反向依赖收集，用于 stop
  activiteEffect.deps.push(effectSet);
}

// 是否应该收集：防止重复收集
export function isTracking() {
  return activiteEffect !== undefined && shouldTrack;
}

// 触发依赖
export function trigger(target: Object, key: keyof any) {
  let depMap = targetMap.get(target);
  let effectSet = depMap?.get(key);

  triggerEffect(effectSet);
}

// 抽离功能，ref
export function triggerEffect(effectSet) {
  if (effectSet) {
    for (const effect of effectSet) {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect.run();
      }
    }
  }
}
