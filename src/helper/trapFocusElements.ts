import { FunctionDirective } from 'vue';

const elementFunctionMap = new WeakMap<HTMLElement, (evt: KeyboardEvent) => void>();
const onKeyDown = (focusableEls: HTMLElement[], e: KeyboardEvent) => {
  const firstFocusableEl = focusableEls[0];
  const lastFocusableEl = focusableEls[focusableEls.length - 1];
  const isTabPressed = e.key === 'Tab';

  if (!isTabPressed) {
    return;
  }

  if (e.shiftKey) {
    if (document.activeElement === firstFocusableEl) {
      lastFocusableEl.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === lastFocusableEl) {
      firstFocusableEl.focus();
      e.preventDefault();
    }
  }
};

const vFocusTrap: FunctionDirective<HTMLElement, boolean> = (element, binding) => {
  element.focus();
  const { value, oldValue } = binding;
  if (value && !elementFunctionMap.has(element)) {
    trapFocus(element);
  }
  if (!value && value !== oldValue && elementFunctionMap.has(element)) {
    element.removeEventListener('keydown', elementFunctionMap.get(element)!);
    elementFunctionMap.delete(element);
  }
};
const trapFocus = (element: HTMLElement) => {
  const focusableEls = Array.from(
    element.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
    )
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const bindedOnKeyDown = onKeyDown.bind(null, focusableEls);
  elementFunctionMap.set(element, bindedOnKeyDown);

  element.addEventListener('keydown', bindedOnKeyDown);
};

export { vFocusTrap };
