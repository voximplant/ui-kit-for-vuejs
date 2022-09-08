import { createEvent, restore } from 'effector';
import { Component, NumpadType, StatusInfo } from '@/types';
import { $settings } from '@/store/settings';

const changeComponentDialingStatus = createEvent<NumpadType>();
const changeComponent = createEvent<Component>();
const changeComponentInfoStatus = createEvent<StatusInfo>();
const changeInfoStatus = createEvent<StatusInfo>();

const $currentComponent = restore<Component>(changeComponent, 'Info');
const $infoComponentStatus = restore<StatusInfo>(changeComponentInfoStatus, 'isNotSignIn');
const $dialingComponentStatus = restore<NumpadType>(changeComponentDialingStatus, 'firstCall');

changeComponent.watch(() => {
  if ($settings.getState().fullscreen) document.exitFullscreen();
});

export {
  changeComponentDialingStatus,
  changeComponent,
  changeComponentInfoStatus,
  changeInfoStatus,
  $currentComponent,
  $infoComponentStatus,
  $dialingComponentStatus,
};
