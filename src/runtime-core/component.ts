export function createComponentInstance(vnode) {
  const component = {
    vnode,
  };

  return component;
}

export function setupComponent(instance) {
  // 无状态组件的处理
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const component = instance.vnode.type;

  const { setup } = component;

  if (setup) {
    const setupResult = setup();

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // setup返回值的两种情况：对象、函数
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const component = instance.vnode.type;

  // 将render函数挂载到实例上
  if (component.render) {
    instance.render = component.render;
  }
}
