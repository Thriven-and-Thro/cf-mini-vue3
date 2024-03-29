import { reactive } from "../reactive";
import { effect, stop } from "../effect";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(2);

    user.age++;

    expect(nextAge).toBe(3);
  });

  // 1. effect会返回一个函数
  // 2. 该函数调用会返回effect函数中的执行结果
  it("should return runner when call effect", () => {
    let foo = 0;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(1);
    const r = runner();
    expect(foo).toBe(2);
    expect(r).toBe("foo");
  });

  // 1. effect 可传入第二个参数对象，其中有属性函数 scheduler
  // 2. 触发 effect 会执行参数1的函数
  // 3. 之后触发依赖则不会执行参数1的函数而是执行 scheduler
  // 4. 但是执行 effect 的返回值时还是执行参数1的函数
  it("scheduler", () => {
    let dummy;
    let run;
    let obj = reactive({ foo: 1 });
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });

  // 1. 调用后清除该函数的响应式对象对其的依赖
  it("stop", () => {
    let dummy;
    const user = reactive({
      age: 0,
    });
    const runner = effect(() => {
      dummy = user.age;
    });
    expect(dummy).toBe(0);
    user.age = 1;
    expect(dummy).toBe(1);
    stop(runner);
    user.age = 2;
    expect(dummy).toBe(1);
    runner();
    expect(dummy).toBe(2);
  });

  // 2. 调用stop后会触发传入的onStop函数
  it("onStop", () => {
    let dummy;
    const user = reactive({
      age: 0,
    });
    const onStop = jest.fn();
    const runner = effect(
      () => {
        dummy = user.age;
      },
      {
        onStop,
      }
    );
    stop(runner);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("stop meta", () => {
    let dummy;
    const user = reactive({
      age: 0,
    });
    // effect() -> shouldTrack=true -> fn() -> get -> track -> shouldTrack=false
    const runner = effect(() => {
      dummy = user.age;
    });
    // user.age = user.age+1
    // get->set：所以会再次收集一次依赖
    // get -> track -> shouldTrack -> return
    user.age++;
    stop(runner);
    user.age++;
    expect(dummy).toBe(1);

    runner();
    expect(dummy).toBe(2);
  });

  it("分支处理", () => {
    const obj1 = reactive({ num: 1 }),
      obj2 = reactive({ num: 2 });

    const fn = jest.fn(() => {
      obj1.num === 1 ? obj2.num : false;
    });
    effect(fn);

    obj1.num++;
    expect(fn).toHaveBeenCalledTimes(2);
    // 此时obj1.num!==1
    // 应该走false的分支，所以读取obj2.num理应不触发依赖
    obj2.num++;
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
