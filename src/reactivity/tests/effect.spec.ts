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
});
