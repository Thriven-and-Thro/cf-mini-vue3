import { reactive } from "../reactive";
import { effect } from "../effect";

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
});
