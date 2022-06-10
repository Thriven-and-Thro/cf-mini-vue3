import { createComponentInstance, setupComponent } from "./component";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 1.element：type为string
  // 2.component：type为object有setup、render
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (typeof vnode.type === "object") {
    processComponent(vnode, container);
  }
}

// if element
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

// if component
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

// init Element
function mountElement(vnode, container) {
  // 1.创建
  // 获取element的虚拟节点到vnode
  const el = (vnode.el = document.createElement(vnode.type));

  // 2.处理
  const { props, children } = vnode;

  // props
  for (const key in props) {
    el.setAttribute(key, props[key]);
  }

  // children
  // 1.string 2.array
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }

  // 3.挂载
  container.append(el);
}

// 递归处理子节点
function mountChildren(vnode, container) {
  for (const child of vnode.children) {
    patch(child, container);
  }
}

// init component
function mountComponent(initialVnode, container) {
  const instance = createComponentInstance(initialVnode);

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  // 实例组件的处理
  setupComponent(instance);

  setupRenderEffect(instance, container, initialVnode);
}

function setupRenderEffect(instance, container, initialVnode) {
  // 使使用的render中的this指向代理对象
  const subTree = instance.render.call(instance.proxy);

  patch(subTree, container);

  // 当所有子节点挂载完毕，获取该组件的虚拟节点
  initialVnode.el = subTree.el;
}
