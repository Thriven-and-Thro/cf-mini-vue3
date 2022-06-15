import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";

export function createComponentInstance(vnode) {
  const component: any = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
  };

  // 使用bind为emit绑定第一个参数
  component.emit = emit.bind(null, component);

  return component;
}

export function setupComponent(instance) {
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
    // setup的props，需要只读
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });

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
