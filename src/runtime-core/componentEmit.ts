import { camelize, toHandlerKey } from "../shared/index";

export function initEmit(instance, event, ...args) {
  // TPP
  // 具体 -> 整体

  const handlerName = toHandlerKey(camelize(event));
  const { props } = instance;

  if (handlerName in props) {
    props[handlerName](...args);
  }
}
