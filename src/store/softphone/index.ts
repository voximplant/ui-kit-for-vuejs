import { createEvent, createStore } from 'effector';
import { PhoneInput } from '@/types';
import { InputState } from '@voximplant/spaceui';

const changeInputValue = createEvent<{ value: string; event: 'change' | 'input' }>();
const actionOnBtn = createEvent<string>();
const changeInputState = createEvent<InputState>();

const $phoneInput = createStore<PhoneInput>({
  inputValue: '',
  state: 'default',
});

export { changeInputValue, actionOnBtn, $phoneInput, changeInputState };
