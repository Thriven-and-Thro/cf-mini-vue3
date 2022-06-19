import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  // 重命名方便调试
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProps,
    insert: hostInsert,
  } = options;

  function render(vnode, container, parentComponent) {
    patch(vnode, container, parentComponent);
  }

  function patch(vnode, container, parentComponent) {
    const { shapeFlag } = vnode;

    switch (vnode.type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processText(vnode, container);
        break;
      default:
        // 1.element：type为string
        // 2.component：type为object有setup、render
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }

  // if Fragment
  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
  }

  // if Text
  function processText(vnode, container) {
    // 注意为vnode.el挂载
    const textNode = (vnode.el = document.createTextNode(vnode.children));
    container.append(textNode);
  }

  // if element
  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent);
  }

  // if component
  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent);
  }

  // init Element
  function mountElement(vnode, container, parentComponent) {
    // 1.创建
    // 获取element的虚拟节点到vnode
    const el = (vnode.el = hostCreateElement(vnode.type));

    // 2.处理
    const { props, children, shapeFlag } = vnode;

    // props
    hostPatchProps(el, props);

    // children
    // 1.string 2.array
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    // 3.挂载
    hostInsert(el, container);
  }

  // 递归处理子节点
  function mountChildren(vnode, container, parentComponent) {
    for (const child of vnode.children) {
      patch(child, container, parentComponent);
    }
  }

  // init component
  function mountComponent(initialVnode, container, parentComponent) {
    const instance = createComponentInstance(initialVnode, parentComponent);

    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    // 实例组件的处理
    setupComponent(instance);

    setupRenderEffect(instance, container, initialVnode);
  }

  function setupRenderEffect(instance, container, initialVnode) {
    // 使使用的render中的this指向代理对象
    const subTree = instance.render.call(instance.proxy);

    patch(subTree, container, instance);

    // 当所有子节点挂载完毕，获取该组件的虚拟节点
    initialVnode.el = subTree.el;
  }

  // 将createApp函数过载在renderer对象上
  // 在src\runtime-dom\index.ts暴露给客户使用
  // 调用createAppAPI传递render
  return {
    createApp: createAppAPI(render),
  };
}
