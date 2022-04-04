### computed(getter)：

- 作用：入口函数
- new ComputedRefImpl(getter)

### class ComputedRefImpl：

- 变量：
  - dep
  - effect
  - \_dirty：锁
  - \_value

#### constructor(getter)：

- 主要逻辑：
  - new ReactiveEffect(getter, scheduler)
  - scheduler 中进行解锁，并执行 triggerRefValue 触发依赖

#### get value()

- 主要逻辑：
  - 依赖收集
  - 若上锁状态，则不执行 effect.run()，以此达到缓存的效果
  - 即 computed 的依赖触发是在 get 而不是在 set
