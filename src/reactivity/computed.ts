// 思路：
// 通过 ActiviteEffect 进行依赖收集
// 通过传入 scheduler 实现懒调用及set时取消缓存
// 通过 dirty 实现缓存

import { ActiviteEffect } from "./effect";

class ComputedRefImpl {
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ActiviteEffect;

  constructor(getter: () => any) {
    // 使用ActiviteEffect的目的是为了需要在触发依赖时做操作
    // 原本set之后应该触发依赖，但此处传入scheduler，故不会触发依赖，
    // 而是执行scheduler，在其中修改dirty取消缓存
    // 并且在下次get的时候通过run方法触发依赖更新值
    this._effect = new ActiviteEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    if (this._dirty) {
      // 实现缓存
      this._dirty = false;
      // 触发依赖
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter: () => any) {
  return new ComputedRefImpl(getter);
}
