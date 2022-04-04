### 变量注解

- dep：为 Set，保存 ReactiveEffect 的实例
- effect：ReactiveEffect 的实例

### effect(fn, options = {})：

- 作用：入口函数
- 参数：
  - fn：依赖的函数
  - options：配置，可传入 scheduler 或 onStop
- 主要逻辑：
  - 创建 ReactiveEffect 实例
  - 将 option 合并到实例中
  - 使用实例执行 run 方法
  - 实例的 run 方法绑定 this 为该实例并赋值给变量 runner（让用户可自行选择调用时机）
  - 在 runner 对象上挂载 effect 方法指向该实例（是为了 triggerEffects 函数可以调用实例上的方法（比如 scheduler））
  - 返回 runner

### 全局变量

- let activeEffect = void 0：用于获取执行函数的 ReactiveEffect 封装
- let shouldTrack = false
- const targetMap = new WeakMap()

### class ReactiveEffect：

- 作用：其实例为依赖项的封装
- 值：
  - active = true：是否需要收集依赖
  - deps = []：依赖项对响应式对象的依赖
  - onStop?: () => void：清除依赖的回调函数

#### constructor(public fn, public scheduler?)：

- 参数：
  - scheduler：回调函数。当触发依赖时，不调用 fn 而是调用 scheduler，逻辑在 isTracking 函数。computed 的实现逻辑就使用了该参数

#### run()：

- 作用：进行依赖收集
- 主要逻辑：
  - 判断 active
  - 开启依赖收集：shouldTrack = true、activeEffect = this
  - 重置，关闭收集依赖

#### stop()：

- 作用：清除依赖项对响应式对象的依赖
- 主要逻辑：
  - 若 active 为 true，执行 cleanupEffect、onStop
  - active = false

### cleanupEffect(effect)：

- 作用：清除操作
- 主要逻辑：
  - 删除 deps 中所有 set 的 effect
  - deps.length = 0

### track(target, type, key)：

- 作用：查找 target 对应的 depsMap 对应的属性依赖项 dep，用于 get
- 主要逻辑：
  - isTracking 函数判断
  - 有相关的数据结构直接获取，没有则创建
    - depsMap = targetMap.get(target)
    - dep = depsMap.get(key)
  - trackEffects(dep)

### trackEffects(dep)：

- 作用：收集依赖
- 主要逻辑：
  - dep.add(activeEffect)
  - activeEffect.deps.push(dep)

### trigger(target, type, key)：

- 作用：触发依赖，用于 set
- 主要逻辑：
  - 获取 dep，同上
  - 将 deps 的所有 dep 合并为一个 dep，传入 triggerEffects 函数

### isTracking()：

- shouldTrack && activeEffect !== undefined

### triggerEffects(dep)：

- 主要逻辑：
  - 遍历 dep，若 effect 有 scheduler 方法则执行，否则执行 run 方法
