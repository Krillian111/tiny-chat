export function expectNoErrorsInMessage(msg: unknown) {
  expect(msg).not.toEqual(expect.objectContaining({ error: expect.anything() }));
}
