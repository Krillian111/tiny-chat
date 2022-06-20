export function expectNoErrorsInMessage(msg: unknown) {
  expect(msg).not.toEqual(expect.objectContaining({ error: expect.anything() }));
}

export function expectValidationError(type: string, msg: unknown) {
  expect(msg).toEqual(expect.objectContaining({ type, error: expect.any(Array) }));
}

export function expectJoinSuccess(msg: unknown) {
  expect(msg).toEqual({ type: "join-response", payload: { userId: expect.any(String), userName: expect.any(String) } });
}
