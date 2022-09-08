import { SignInFields } from '@/types';

const SDK_LOGIN_STORE_KEY = 'sdk_login_data';

export const saveLoginData = (payload: SignInFields): void => {
  const data = JSON.stringify(payload);
  window.localStorage.setItem(SDK_LOGIN_STORE_KEY, data);
};
export const getLoginData = (): SignInFields | false => {
  const result = window.localStorage.getItem(SDK_LOGIN_STORE_KEY);
  return result ? JSON.parse(result) : false;
};
export const removeLoginData = (): void => {
  localStorage.removeItem(SDK_LOGIN_STORE_KEY);
};
