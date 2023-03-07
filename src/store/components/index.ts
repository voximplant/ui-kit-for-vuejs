import { createEvent, restore } from 'effector';
import { Component, NumpadType, StatusInfo } from '@/types';
import {
  $settings,
  changeSoftphoneParameters,
  resetCallDestination,
  toggleFullScreen,
} from '@/store/settings';

const changeComponentDialingStatus = createEvent<NumpadType>();
const changeComponent = createEvent<Component>();
const changeComponentInfoStatus = createEvent<StatusInfo>();
const changeInfoStatus = createEvent<StatusInfo>();

const $currentComponent = restore<Component>(changeComponent, 'Info');
const $infoComponentStatus = restore<StatusInfo>(changeComponentInfoStatus, 'isNotSignIn');
const $dialingComponentStatus = restore<NumpadType>(changeComponentDialingStatus, 'firstCall');

changeComponent.watch(() => {
  // in full screen mode, only video call is available
  if ($settings.getState().fullscreen) toggleFullScreen(false);
});

const setNotSignInComponent = (): void => {
  resetCallDestination();
  changeComponent('SignUp');
  changeSoftphoneParameters({ status: '' });
};

const openAccessMicrophoneInfo = (): void => {
  changeComponent('Info');
  changeComponentInfoStatus('accessMicrophone');
};

export {
  changeComponentDialingStatus,
  changeComponent,
  changeComponentInfoStatus,
  changeInfoStatus,
  $currentComponent,
  $infoComponentStatus,
  $dialingComponentStatus,
  setNotSignInComponent,
  openAccessMicrophoneInfo,
};
