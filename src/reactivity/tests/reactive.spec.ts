import { isProxy, isReactive, reactive } from "../reactive";

// 分离
describe("reactive", () => {
  it("happy path", () => {
    const user = { age: 1 };
    const userProxy = reactive(user);
    expect(userProxy).not.toBe(user);
    expect(userProxy.age).toBe(1);
  });

  it("isReactive isProxy", () => {
    const user = { age: 1 };
    const userProxy = reactive(user);
    expect(isReactive(userProxy)).toBe(true);
    expect(isReactive(user)).toBe(false);
    expect(isProxy(userProxy)).toBe(true);
  });

  it("deep reactive", () => {
    const user = { age: 1, hobbies: [1, 2] };
    const userProxy = reactive(user);
    expect(isReactive(userProxy)).toBe(true);
    expect(isReactive(userProxy.hobbies)).toBe(true);
  });
});
