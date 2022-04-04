### ref(value)：

- 作用：入口函数
- createRef(value)

### class RefImp：

- 变量：
  - \_\_rawValue：保存原始对象
  - \_value：保存 ref 对象
  - dep
  - \_\_v_isRef：是否 ref

#### constructor(value)：

- 作用：创建一个 ref 对象
- 主要逻辑：
  - \_\_value = convert(value)
  - dep = createDep()

#### get value()：

- trackRefValue(this)

#### set value(newValue)：

- 主要逻辑：
  - hasChanged 对新旧值判断
  - triggerRefValue(this)

### convert(value)：

- isObject(value) ? reactive(value) : value

### createRef(value)：

- new RefImpl(value)

### triggerRefValue(ref)：

- triggerEffects(ref.dep)

### trackRefValue(ref)：

- trackEffects(ref.dep)

### 对象：shallowUnwrapHandlers

- get(target, key, receiver)：unRef(Reflect.get(target, key, receiver))
- set(target, key, value, receiver)：Reflect.set(target, key, value, receiver)

### proxyRefs(objectWithRefs)：

- 作用：浅解包
- 主要逻辑：
  - new Proxy(objectWithRefs, shallowUnwrapHandlers)

### unRef(ref)：

- isRef(ref) ? ref.value : ref

### isRef(value)：

- !!value.\_\_v_isRef
