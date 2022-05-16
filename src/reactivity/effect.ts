let activiteEffect;
class ActiviteEffect {
  _fn: any;

  constructor(fn) {
    this._fn = fn;
  }

  run() {
    activiteEffect = this;
    this._fn();
  }
}

export function effect(fn) {
  const activiteFn = new ActiviteEffect(fn);
  activiteFn.run();
}

const targetMap = new WeakMap();
export function track(target, key) {
  let depMap = targetMap.get(target);
  if (!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap);
  }
  let effectSet = depMap.get(key);
  if (!effectSet) {
    effectSet = new Set();
    depMap.set(key, effectSet);
  }
  effectSet.add(activiteEffect);
}

export function trigger(target, key) {
  let depMap = targetMap.get(target);
  let effectSet = depMap.get(key);

  for (const effect of effectSet) {
    effect.run();
  }
}
