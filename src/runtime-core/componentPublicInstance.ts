import { hasOwn } from "../shared/index";

// 封装组件实例上的代理
const PublicPropertiesMap = new Map<string, (args: any) => any>([
  ["$el", (i) => i.vnode.el],
]);

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      return instance.setupState[key];
    } else if (hasOwn(props, key)) {
      return instance.props[key];
    }

    if (PublicPropertiesMap.has(key)) {
      return PublicPropertiesMap.get(key)?.(instance);
    }
  },
};
