import { reactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const user = { age: 1 };
    const userProxy = reactive(user);
    expect(userProxy).not.toBe(user);
    expect(userProxy.age).toBe(1);
  });
});
