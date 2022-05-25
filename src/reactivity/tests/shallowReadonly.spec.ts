import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("base", () => {
    const user = { age: 1, hobbies: [1, 2] };
    const userProxy = shallowReadonly(user);
    expect(isReadonly(userProxy)).toBe(true);
    expect(isReadonly(userProxy.hobbies)).toBe(false);
    console.warn = jest.fn();
    userProxy.age++;
    expect(console.warn).toBeCalled();
  });
});
