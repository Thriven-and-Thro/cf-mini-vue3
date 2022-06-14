import { initProps } from "./componentProps";

export function createComponentInstance(vnode) {
  const component: any = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };

  return component;
}

export function setupComponent(instance) {
  debugger;
  // initProps
  initProps(instance, instance.vnode.props);
  // initSolts

  // 无状态组件的处理
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const component = instance.vnode.type;

  const { setup } = component;

  if (setup) {
    // setup的props
    const setupResult = setup(instance.props);

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
