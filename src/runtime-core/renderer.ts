import { effect } from "../reactivity/index";
import { EMPTY_OBJECT } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  // 重命名方便调试
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
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
    mountChildren(n2.children, container, parentComponent);
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
      patchElement(n1, n2, container, parentComponent);
    }
  }

  function patchElement(n1, n2, container, parentComponent) {
    console.log("patchElement", n1, n2);

    // 带上默认值
    // 使用EMPTY_OBJECT，是因为后续情况3的优化要根据同个对象进行判断
    const oldProps = n1.props || EMPTY_OBJECT;
    const newProps = n2.props || EMPTY_OBJECT;

    // 此处 n2.el = n1.el 是因为n2不走mountElement，故其节点上el没有赋值
    // 而后续n2需要比较则不能没有el
    // 而且n2是替换n1的，是同一个节点所以el可以赋值
    const el = (n2.el = n1.el);

    // patch children
    // 坑
    // 此处container参数应该传el，否则子节点中的container依然是当前节点的
    patchChildren(n1, n2, el, parentComponent, anchor);

    // patch props
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent) {
    const prevShapFlag = n1.shapeFlag;
    const c1 = n1.children;
    const nextShapFlag = n2.shapeFlag;
    const c2 = n2.children;

    // to Text
    if (nextShapFlag & ShapeFlags.TEXT_CHILDREN) {
      //  Array
      if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      // Array/Text
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
      // to Array
    } else {
      // Text
      if (prevShapFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent);
      }
    }
  }

  function unmountChildren(children) {
    for (const child of children) {
      hostRemove(child.el);
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const nextProp = newProps[key];
        const prevProp = oldProps[key];

        if (prevProp !== nextProp) {
          // 情况1
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJECT) {
        // 情况3
        for (const key in oldProps) {
          if (!(key in newProps)) {
            // 手动让属性值为null，模拟情况2
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
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
    for (const key in props) {
      hostPatchProp(el, key, null, props[key]);
    }

    // children
    // 1.string 2.array
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent);
    }

    // 3.挂载
    hostInsert(el, container);
  }

  // 递归处理子节点
  function mountChildren(children, container, parentComponent) {
    for (const child of children) {
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
      if (!instance.isMounted) {
        // 第一次渲染
        // 使使用的render中的this指向代理对象
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        ));

        patch(null, subTree, container, instance);

        // 当所有子节点挂载完毕，获取该组件的虚拟节点
        initialVnode.el = subTree.el;

        instance.isMounted = true;
      } else {
        // 更新
        const subTree = instance.render.call(instance.proxy);
        const preSubTree = instance.subTree;

        initialVnode.el = subTree.el;
        instance.subTree = subTree;
        patch(preSubTree, subTree, container, instance);
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
