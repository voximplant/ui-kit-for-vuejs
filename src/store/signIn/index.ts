import { createEffect, createEvent, createStore } from 'effector';
import { QueueType, SignInErrors, SignInFields } from '@/types';

const restoreFillForm = createEvent();
const checkErrors = createEvent();
const setError = createEvent<{
  field: keyof SignInErrors;
  value: string;
}>();
const fillForm = createEvent<{
  field: keyof SignInFields;
  value: string | boolean | QueueType;
}>();
const loginFx = createEffect();
const logoutFx = createEffect();

const $signInFields = createStore<SignInFields>({
  userName: '',
  password: '',
  applicationName: '',
  accountName: '',
  node: '',
  queueType: QueueType.None,
  remember: false,
});
const $signInErrors = createStore<SignInErrors>({
  userName: '',
  password: '',
  applicationName: '',
  accountName: '',
  notEnough: '',
});

export {
  $signInFields,
  $signInErrors,
  restoreFillForm,
  checkErrors,
  setError,
  fillForm,
  loginFx,
  logoutFx,
};
