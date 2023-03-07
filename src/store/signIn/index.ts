import { createEffect, createEvent, createStore } from 'effector';
import { QueueType, SignInErrors, SignInFields } from '@/types';
import { setNotSignInComponent } from '@/store/components';
import { $settings, toggleMaximize, toggleMinimize } from '@/store/settings';

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
const changeReloginStatus = createEvent<boolean>();
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
const $isTryRelogin = createStore<boolean>(false);
const resetSettings = (): void => {
  setNotSignInComponent();
  if ($settings.getState().minimize) toggleMinimize(false);
  else if ($settings.getState().maximize) toggleMaximize(false);
};

export {
  $signInFields,
  $signInErrors,
  $isTryRelogin,
  changeReloginStatus,
  restoreFillForm,
  checkErrors,
  setError,
  fillForm,
  loginFx,
  logoutFx,
  resetSettings,
};
