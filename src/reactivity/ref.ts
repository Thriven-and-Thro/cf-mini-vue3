import { hasChange, isObject } from "../shared/index";
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

// 浅解包
export function proxyRefs(objectWithRefs: any) {
  // 利用proxy
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      // 通过 unRef 实现 当有value时取value，没有时直接返回
      return unRef(Reflect.get(target, key, receiver));
    },
    set(target, key, value, receiver) {
      if (isRef(target[key]) && !isRef(value)) {
        // 特殊处理 赋值为ref对象
        return (target[key].value = value);
      } else {
        // 其他情况 直接赋值
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
