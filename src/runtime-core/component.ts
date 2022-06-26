import { proxyRefs } from "../index";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";

let currentInstacne = null;

export function createComponentInstance(vnode, parent) {
  const component: any = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    parent,
    provides: parent.provides || {},
    slots: {},
    emit: () => {},
    isMount: true,
    subTree: {},
  };

  // 使用bind为emit绑定第一个参数
  component.emit = emit.bind(null, component);

  return component;
}

export function setupComponent(instance) {
  // initProps
  initProps(instance, instance.vnode.props);
  // initSolts
  initSlots(instance, instance.vnode.children);

  // 无状态组件的处理
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const component = instance.vnode.type;

  const { setup } = component;

  if (setup) {
    setCurrentInstance(instance);

    // setup的props，需要只读
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });

    setCurrentInstance(null);

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // setup返回值的两种情况：对象、函数
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
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

export function getCurrentInstance() {
  return currentInstacne;
}

// 将变更状态的操作封装，便于debug该操作的更改
function setCurrentInstance(instance) {
  currentInstacne = instance;
}
