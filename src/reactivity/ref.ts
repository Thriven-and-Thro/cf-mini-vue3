import { hasChange, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

// 类：值类型需要对象包裹，所以用类封装
class RefImpl {
  private _value: any;
  private dep: Set<any>;
  private _raw: any;
  public _v__isRef: boolean;

  constructor(value: any) {
    this._value = convert(value);
    this.dep = new Set();
    this._raw = value;
    this._v__isRef = true;
  }

  get value() {
    trackRefValue(this.dep);
    return this._value;
  }

  set value(newValue) {
    if (!hasChange(newValue, this._raw)) return;
    this._value = convert(newValue);
    this._raw = newValue;
    triggerEffect(this.dep);
  }
}

function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(dep: Set<any>) {
  // 需收集
  if (isTracking()) {
    trackEffect(dep);
  } // 只读值
}

export function ref(value: any) {
  return new RefImpl(value);
}

export function isRef(ref: any) {
  return !!ref._v__isRef;
}

export function unRef(ref: any) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  // 利用proxy
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // 通过 unRef 实现当有value时取value，没有时直接返回
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
