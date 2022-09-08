import { getLoginData, removeLoginData, saveLoginData } from '@/lib/localStoreSignIn';
import {
  $signInErrors,
  $signInFields,
  checkErrors,
  fillForm,
  loginFx,
  logoutFx,
  restoreFillForm,
  setError,
} from '@/store/signIn/index';
import { logout, sdkLogin } from '@/lib/sdkSource';
import { changeComponent, changeComponentInfoStatus } from '@/store/components';
import { changeSoftphoneParameters } from '@/store/settings';

$signInErrors.on(setError, (store, { field, value }) => {
  return {
    ...store,
    [field]: value,
  };
});

$signInFields.on(fillForm, (store, { field, value }) => {
  return {
    ...store,
    [field]: value,
  };
});

$signInFields.on(checkErrors, (store) => {
  const allFieldsFilled =
    store.applicationName.length > 2 &&
    store.password.length > 5 &&
    store.accountName.length > 2 &&
    store.userName.length > 2;
  setError({ field: 'notEnough', value: !allFieldsFilled ? ' ' : '' });
});

$signInFields.watch(() => {
  checkErrors();
});

$signInFields.on(restoreFillForm, (store) => {
  const data = getLoginData() || store;
  checkErrors();
  return {
    ...store,
    ...data,
  };
});

loginFx.use(async () => {
  const fields = $signInFields.getState();
  if (fields.remember) {
    saveLoginData(fields);
  } else {
    removeLoginData();
  }
  try {
    await sdkLogin(fields);
  } catch (e) {
    console.error('errors', e);
  }
});

logoutFx.use(async () => {
  await logout();
  changeComponent('Info');
  changeComponentInfoStatus('isNotSignIn');
  changeSoftphoneParameters({ status: '' });
});
