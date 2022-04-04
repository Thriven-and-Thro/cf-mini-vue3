### createGetter(isReadonly: boolean, shallow: boolean)

- 作用：用于 proxy 中的 get 操作器
- 参数：
  - isReadonly 是否是 readonly
  - shallow 是否是 shallow
- 主要逻辑：
  - 返回与 proxy 格式相同的 get 函数（即 get 操作器）
  - 根据 key、receiver 判断，被用于 isReactive、isReadonly、isRaw
  - 使用 Reflect.get 获取值
  - 调用 track 函数进行依赖收集，注意 readonly 不需要
  - shallow 直接返回结果
  - 若返回值为对象，reactive 需要对其调用 reactive 再返回

### createSetter()

- 作用：用于 proxy 中的 set 操作器
- 主要逻辑：
  - 返回 set 函数
  - 触发依赖

### mutableHandlers()

- 作用：封装 reactive 的操作器，使用 createGetter()、createSetter()

### readonlyHandlers()

- 作用：封装 readonly 的操作器，仅使用 createGetter(true)

### shallowReadonlyHandlers()

- 作用：封装 shallowReadonly 的操作器，仅使用 createGetter(true, true)
