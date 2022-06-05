import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("base", () => {
    const user = reactive({
      age: 1,
    });
    const getter = jest.fn(() => {
      return user.age;
    });
    const comVal = computed(getter);

    // 懒调用
    expect(getter).not.toHaveBeenCalled();
    expect(comVal.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // 缓存
    comVal.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // 更改值
    user.age = 2;
    expect(getter).toHaveBeenCalledTimes(1);
    expect(comVal.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
