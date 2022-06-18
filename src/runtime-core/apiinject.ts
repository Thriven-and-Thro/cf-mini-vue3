import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstacne: any = getCurrentInstance();

  if (currentInstacne) {
    let { provides } = currentInstacne;
    const parentProvides = currentInstacne.parent?.provides;

    // 第一次调用provide
    if (provides === parentProvides) {
      // 利用原型链的查找实现多层组件provide的查找
      provides = currentInstacne.provides = Object.create(parentProvides);
    }

    provides[key] = value;
  }
}

// 注意：当前组件的provide在本组件是获取不到的
// 参数2为默认值，可以为普通值或函数
export function inject(key, defaultValue) {
  const currentInstacne: any = getCurrentInstance();

  if (currentInstacne) {
    const parentProvides = currentInstacne.parent?.provides;

    if (key in parentProvides) {
      return parentProvides[key];
    } else {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
