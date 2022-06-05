import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from "../ref";

describe("ref", () => {
  it("", () => {
    let name = ref("aa");
    expect(name.value).toBe("aa");
  });
  it("base", () => {
    let name = ref("aa");
    let age = 1;
    let newName;
    effect(() => {
      newName = name.value;
      age++;
    });
    name.value = "bb";
    expect(newName).toBe("bb");
    expect(age).toBe(3);
    name.value = "bb";
    expect(age).toBe(3);
  });

  it("object", () => {
    let user = ref({
      name: "a",
    });
    let newName;
    effect(() => {
      newName = user.value.name;
    });
    user.value.name = "b";
    expect(newName).toBe("b");
  });

  it("isRef", () => {
    const age = ref(1);
    const user = reactive({ name: "a" });
    expect(isRef(age)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });

  it("unRef", () => {
    const age = ref(1);
    expect(unRef(age)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  // template 中自动浅解包的实现
  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "cf",
    };
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe("cf");

    proxyUser.age = 11;
    expect(proxyUser.age).toBe(11);
    expect(user.age.value).toBe(11);

    proxyUser.age = ref(12);
    expect(proxyUser.age).toBe(12);
    expect(user.age.value).toBe(12);
  });
});
