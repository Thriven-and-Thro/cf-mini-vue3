// 抽取原runtime-core中创建节点、处理节点属性、插入节点的操作，使其可自定义renderer

import { createRenderer } from "../runtime-core/renderer";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, prevProp, nextProp) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);

  if (isOn(key)) {
    // event
    const event = key.slice(2).toLocaleLowerCase();
    el.addEventListener(event, nextProp);
  } else if (!nextProp) {
    // props 为 undefined或null
    el.removeAttribute(key);
  } else {
    // nextProp
    el.setAttribute(key, nextProp);
  }
}

// 此类对dom元素操作的也放入该文件
function insert(el, parent) {
  parent.append(el);
}

function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}

// 默认的renderer
const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

// 将renderer对象上的createApp暴露出去
export function createApp(...arg) {
  return renderer.createApp(...arg);
}

// runtime-dom是runtime-core的上级
export * from "../runtime-core/index.js";
