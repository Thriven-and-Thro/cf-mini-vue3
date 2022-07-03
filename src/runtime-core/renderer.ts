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
    patch(null, vnode, container, parentComponent, null);
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag, type } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // 1.element：type为string
        // 2.component：type为object有setup、render
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  // if Fragment
  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  // if Text
  function processText(n1, n2, container) {
    // 注意为vnode.el挂载
    const textNode = (n2.el = document.createTextNode(n2.children));
    container.append(textNode);
  }

  // if element
  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      // init tree
      mountElement(n2, container, parentComponent, anchor);
    } else {
      // patch tree
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log("patchElement", n1, n2);

    // 带上默认值
    // 使用EMPTY_OBJECT，是因为后续情况3的优化要根据同个对象进行判断
    const oldProps = n1.props || EMPTY_OBJECT;
    const newProps = n2.props || EMPTY_OBJECT;

    // 此处 n2.el = n1.el 是因为n2不走mountElement，故其节点上el没有赋值
    // 而后续n2需要比较则不能没有el
    // 而且n2是替换n1的，是同一个节点所以el可以赋值
    const el = (n2.el = n1.el);

    // patch props
    patchProps(el, oldProps, newProps);

    // patch children
    // 坑
    // 此处container参数应该传el，否则子节点中的container依然是当前节点的
    patchChildren(n1, n2, el, parentComponent, anchor);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  // 双端对比算法
  // 目的：锁定中间乱序部分
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    const l1 = c1.length,
      l2 = c2.length;

    // 利用三个变量进行定位比较
    // 循环结束条件为某一组节点的尾结点或头节点
    // 遇到不同节点则停止
    // 最后结果三个变量会停留在两组节点不相同的节点位置上
    let i = 0,
      e1 = l1 - 1,
      e2 = l2 - 1;

    // 左侧
    while (i <= e1 && i <= e2) {
      // 控制变量i
      const n1 = c1[i],
        n2 = c2[i];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
    }

    // 右侧
    while (i <= e1 && i <= e2) {
      // 控制变量e1，e2
      const n1 = c1[e1],
        n2 = c2[e2];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    // 新增
    if (i > e1) {
      if (i <= e2) {
        // 不使用i是因为i会改变，对于新增多个节点时顺序会出错
        const nextProps = e2 + 1;
        // 锚点，节点将会在锚点之前插入
        const anchor = nextProps < l2 ? c2[nextProps].el : null;

        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
      // 删除
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间节点

      const s1 = i,
        s2 = i,
        // 新节点的映射
        keyToNewIndexMap = new Map(),
        // 新增节点数
        toBePatched = e2 - s2 + 1;
      // 已查找的新增节点数
      let patched = 0;

      // 旧的中间节点对于新的中间节点的映射
      const newIndexToOldIndexMap = new Array(toBePatched);
      // 初始化，0表示需要新增
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      let moved = false,
        maxNewIndexSoFar = 0;

      // 添加至映射
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      // 在旧节点中查找
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        // 优化点：
        // 新增节点查找完毕，说明剩下的都是需要删除的，所以直接删除不继续查找
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        // 若旧节点有key，使用映射查找
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
          // 反之，遍历查找
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        // 旧节点中存在
        if (newIndex !== undefined) {
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          // 避开0
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patched++;

          // 优化点
          // 当旧节点不是始终递增时，才将其标为true：需移位
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          // 不存在删除，该步骤处理掉新节点中不存在的旧节点
        } else {
          hostRemove(prevChild.el);
        }
      }

      // 求出旧中间节点相对于新的最长递增子序列，使其不移位
      const incressingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];

      // 倒序
      // 因为插入时需基于后一位，故后一位需先确定
      let j = incressingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;

        // 增加节点
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== incressingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
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
  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  // init Element
  function mountElement(vnode, container, parentComponent, anchor) {
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
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    // 3.挂载
    hostInsert(el, container, anchor);
  }

  // 递归处理子节点
  function mountChildren(children, container, parentComponent, anchor) {
    for (const child of children) {
      patch(null, child, container, parentComponent, anchor);
    }
  }

  // init component
  function mountComponent(initialVnode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVnode, parentComponent);

    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    // 实例组件的处理
    setupComponent(instance);

    setupRenderEffect(instance, container, initialVnode, anchor);
  }

  function setupRenderEffect(instance, container, initialVnode, anchor) {
    // 使用effect对依赖进行收集
    effect(() => {
      if (!instance.isMounted) {
        // 第一次渲染
        // 使使用的render中的this指向代理对象
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        ));

        patch(null, subTree, container, instance, null);

        // 当所有子节点挂载完毕，获取该组件的虚拟节点
        initialVnode.el = subTree.el;

        instance.isMounted = true;
      } else {
        // 更新
        const subTree = instance.render.call(instance.proxy);
        const preSubTree = instance.subTree;

        initialVnode.el = subTree.el;
        instance.subTree = subTree;
        patch(preSubTree, subTree, container, instance, anchor);
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

// 最长递增子序列（不连续）
function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
