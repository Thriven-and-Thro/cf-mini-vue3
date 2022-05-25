import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("base", () => {
    const user = { hobbies: [1, 2] };
    const userProxy = shallowReadonly(user);
    expect(isReadonly(userProxy)).toBe(true);
    expect(isReadonly(userProxy.hobbies)).toBe(false);
  });
});
