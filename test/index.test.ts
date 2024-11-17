describe('Basic Test Suite', () => {
  it('should pass a simple assertion', () => {
    expect(true).toBe(true);
  });

  it('should pass another assertion', () => {
    const value = 1 + 1;
    expect(value).toBe(2);
  });
});
