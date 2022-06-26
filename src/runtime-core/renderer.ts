import { effect } from "../reactivity/index";
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
    patch(null, vnode, container, parentComponent);
  }

  function patch(n1, n2, container, parentComponent) {
    const { shapeFlag, type } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // 1.element：type为string
        // 2.component：type为object有setup、render
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  // if Fragment
  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }

  // if Text
  function processText(n1, n2, container) {
    // 注意为vnode.el挂载
    const textNode = (n2.el = document.createTextNode(n2.children));
    container.append(textNode);
  }

  // if element
  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      // init tree
      mountElement(n2, container, parentComponent);
    } else {
      // patch tree
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    console.log("patchElement");
    console.log(n1, n2);
  }

  // if component
  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent);
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
      patch(null, child, container, parentComponent);
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
    // 使用effect对依赖进行收集
    effect(() => {
      if (instance.isMount) {
        // 第一次渲染
        // 使使用的render中的this指向代理对象
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        ));

        patch(null, subTree, container, instance);

        // 当所有子节点挂载完毕，获取该组件的虚拟节点
        initialVnode.el = subTree.el;

        instance.isMount = false;
      } else {
        // 更新
        const subTree = instance.render.call(instance.proxy);
        const preSubTree = instance.subTree;
        patch(preSubTree, subTree, container, instance);
        initialVnode.el = subTree.el;

        instance.subTree = subTree;
      }
    });
  }

  // 将createApp函数过载在renderer对象上
  // 在src\runtime-dom\index.ts暴露给客户使用
  // 调用createAppAPI传递render
  return {
    createApp: createAppAPI(render),
  };
}
