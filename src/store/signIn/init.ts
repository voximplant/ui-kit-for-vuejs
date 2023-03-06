import { getLoginData, removeLoginData, saveLoginData } from '@/lib/localStoreSignIn';
import {
  $isTryRelogin,
  $signInErrors,
  $signInFields,
  changeReloginStatus,
  checkErrors,
  fillForm,
  loginFx,
  logoutFx,
  resetSettings,
  restoreFillForm,
  setError,
} from '@/store/signIn/index';
import { isClientLoggedIn, logout, sdkLogin } from '@/lib/sdkSource';

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
    store.applicationName.length &&
    store.password.length > 5 &&
    store.accountName.length &&
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

$isTryRelogin.on(changeReloginStatus, (store, status) => status);

loginFx.use(async () => {
  const fields = $signInFields.getState();
  if (fields.remember) {
    saveLoginData(fields);
    changeReloginStatus(fields.remember); // set flag to retry login when user ConnectionClosed
  } else {
    removeLoginData();
  }
  try {
    await sdkLogin(fields);
  } catch (e) {
    console.error('errors', e);
    throw Error(e);
  }
});

logoutFx.use(async () => {
  if (isClientLoggedIn()) {
    changeReloginStatus(false); // reset the re-login attempt flag
    await logout().then(() => resetSettings());
  }
});
