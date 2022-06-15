import { camelize, toHandlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
  // TPP
  // 具体 -> 通用

  // other-btn => otherBtn => onOtherBtn
  const handlerName = toHandlerKey(camelize(event));
  const { props } = instance;

  if (handlerName in props) {
    props[handlerName](...args);
  }
}
