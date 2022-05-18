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
});
