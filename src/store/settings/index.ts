import { createEffect, createEvent, createStore } from 'effector';
import { OperatorACDStatuses } from 'voximplant-websdk';
import { DropdownOptionProps } from '@voximplant/spaceui';
import { Settings, SoftphoneParameters } from '@/types';
import { Devices } from '@/store/settings/init';
import { setActiveCall } from '@/store/calls';
import { changeComponentDialingStatus } from '@/store/components';
import { changeInputState, changeInputValue } from '@/store/softphone';

const getRingtone = createEvent();
const setRingtoneParam = createEvent();
const toggleMinimize = createEvent<boolean>();
const toggleMaximize = createEvent<boolean>();
const changeVolume = createEvent<{ callVolume?: number; ringtoneVolume?: number }>();
const setTitleStatus = createEvent<string>();
const setQueueStatus = createEvent<OperatorACDStatuses>(); // set the status only in $queueStatus store
const changeQueueStatus = createEvent<keyof typeof OperatorACDStatuses>(); // change queueStatus in SDK https://voximplant.com/docs/references/websdk/voximplant/client#setoperatoracdstatus
const toggleBannedStatus = createEvent<boolean>();
const addActiveAudioDevice = createEvent<DropdownOptionProps>();
const addActiveVideoDevice = createEvent<DropdownOptionProps>();
const getDevicesFx = createEffect<null, Devices, void>();
const changeMute = createEvent<boolean>();
const changeVideoMute = createEvent<boolean>();
const toggleSharingVideo = createEvent<boolean>();
const toggleRemoteSharing = createEvent<boolean>();
const toggleFullScreen = createEvent<boolean>();
const changeSoftphoneParameters = createEvent<{
  micAccessResult?: boolean;
  status?: string;
}>();
const toggleReconnect = createEvent<boolean>();
const toggleShowPauseNotification = createEvent<boolean>();

const $queueStatus = createStore<OperatorACDStatuses>(OperatorACDStatuses.Online);
const $isBannedStatus = createStore(false);
const $settings = createStore<Settings>({
  minimize: false,
  maximize: false,
  activeAudioDevice: { label: '', value: '' },
  activeVideoDevice: { label: '', value: '' },
  ringtoneVolume: 1,
  callVolume: 1,
  audioDevices: [],
  videoDevices: [],
  audios: [],
  ringtone: {} as HTMLAudioElement,
  mute: false,
  videoMute: false,
  sharing: false,
  remoteSharing: false,
  fullscreen: false,
  reconnect: false,
  showPauseNotification: false,
});
const $softphoneParameters = createStore<SoftphoneParameters>({
  micAccessResult: false, // user microphone access flag
  status: '', // user state after login
});

const resetCallSettings = (): void => {
  setActiveCall('');
  changeComponentDialingStatus('firstCall');
  // reset call settings
  changeMute(false);
  changeVideoMute(false);
  toggleSharingVideo(false);
  toggleRemoteSharing(false);
};

const resetCallDestination = (): void => {
  // reset call destination input value
  changeInputValue({ event: 'change', value: '' });
  changeInputState('default');
};

export {
  $settings,
  $queueStatus,
  $isBannedStatus,
  $softphoneParameters,
  getRingtone,
  setRingtoneParam,
  setTitleStatus,
  setQueueStatus,
  changeVolume,
  changeQueueStatus,
  toggleBannedStatus,
  changeMute,
  changeSoftphoneParameters,
  toggleMinimize,
  toggleMaximize,
  addActiveAudioDevice,
  addActiveVideoDevice,
  getDevicesFx,
  changeVideoMute,
  toggleSharingVideo,
  toggleRemoteSharing,
  toggleFullScreen,
  toggleReconnect,
  resetCallSettings,
  toggleShowPauseNotification,
  resetCallDestination,
};
