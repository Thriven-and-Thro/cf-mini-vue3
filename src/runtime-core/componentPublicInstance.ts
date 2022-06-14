// 封装组件实例上的代理
const PublicPropertiesMap = new Map<string, (args: any) => any>([
  ["$el", (i) => i.vnode.el],
]);

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key in instance.setupState) {
      return instance.setupState[key];
    }

    if (key in instance.props) {
      return instance.props[key];
    }

    if (PublicPropertiesMap.has(key)) {
      return PublicPropertiesMap.get(key)?.(instance);
    }
  },
};
