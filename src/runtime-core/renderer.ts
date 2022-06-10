import { createComponentInstance, setupComponent } from "./component";

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
  const el = document.createElement(vnode.type);

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
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);

  // 实例组件的处理
  setupComponent(instance);

  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();

  patch(subTree, container);
}
