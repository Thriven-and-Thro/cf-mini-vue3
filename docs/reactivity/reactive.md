### 缓存

```ts
export const reactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();
export const shallowReadonlyMap = new WeakMap();
```

### reactive(target)：

- 作用：转成响应式对象
- 参数：
  - target：对象
- 主要逻辑：
  - createReactiveObject(target, reactiveMap, mutableHandlers)

### createReactiveObject(target, proxyMap, baseHandlers)：

- 参数：
  - proxyMap：缓存
  - baseHandlers：操作器，查看 baseHandlers.md
- 主要逻辑：
  - 判断是否有缓存，有缓存直接返回
  - 使用 proxy
  - 将返回的 proxy 对象加入缓存

### readonly(target)：

- createReactiveObject(target, readonlyMap, readonlyHandlers);

### shallowReadonly(target)：

- createReactiveObject(target, shallowReadonlyMap, shallowReadonlyHandlers);

### isProxy(value)：

- isReactive(value) || isReadonly(value);

### isReactive(value)：

- 主要逻辑：
  - !!value[ReactiveFlags.IS_REACTIVE];
  - 若 value 是 proxy，则会调用 get，转 baseHandlers 的 createGetter 函数返回布尔值
  - 否则为 undefined，!! 转布尔值

### isReadonly(value)：

- !!value[ReactiveFlags.IS_READONLY];

### toRaw(value)：

- 主要逻辑：
  - 若 value 是 proxy，转 baseHandlers 的 createGetter 函数直接返回
  - 否则为 undefined 直接返回原 value
