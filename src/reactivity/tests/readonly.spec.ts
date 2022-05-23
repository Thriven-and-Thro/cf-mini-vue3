import { isReadonly, readonly } from "../reactive";

describe("readonly", () => {
  // 1. 不可写
  // 2. 写时会触发警告
  it("base", () => {
    const user = { age: 0 };
    const userProxy = readonly({ age: 0 });
    expect(userProxy).not.toBe(user);
    expect(userProxy.age).toBe(0);

    console.warn = jest.fn();
    userProxy.age = 1;
    expect(console.warn).toBeCalled();
  });

  it("isReadonly", () => {
    const user = { age: 0 };
    const userProxy = readonly({ age: 0 });
    expect(isReadonly(userProxy)).toBe(true);
    expect(isReadonly(user)).toBe(false);
  });
});
