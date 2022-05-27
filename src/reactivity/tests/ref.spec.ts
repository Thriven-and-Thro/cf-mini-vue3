import { effect } from "../effect";
import { ref } from "../ref";

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
});
