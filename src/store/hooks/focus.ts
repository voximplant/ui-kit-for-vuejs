export const onFocusInputPhone = (event: KeyboardEvent, input: HTMLInputElement): void => {
  if (event.key.match(/^[a-zA-Z0-9@_()-/$]$/)) input?.focus();
};
