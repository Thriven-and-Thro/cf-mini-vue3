export function initProps(instance, rawProps) {
  // 默认值防止shallowReadonly中proxy参数为非对象报错
  instance.props = rawProps || {};

  // attrs
}
