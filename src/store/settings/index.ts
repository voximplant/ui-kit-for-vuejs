import { createEffect, createEvent, createStore, restore } from 'effector';
import { OperatorACDStatuses } from 'voximplant-websdk';
import { DropdownOptionProps } from '@voximplant/spaceui';
import { Settings, SoftphoneParameters } from '@/types';
import { setAudioParam } from '@/lib/sdkSource';
import { Devices } from '@/store/settings/init';

const getAudios = createEvent();
const getRingtone = createEvent();
const setRingtoneParam = createEvent();
const toggleMinimize = createEvent<boolean>();
const toggleMaximize = createEvent<boolean>();
const changeVolume = createEvent<{ callVolume?: number; ringtoneVolume?: number }>();
const setTitleStatus = createEvent<string>();
const setQueueStatus = createEvent<OperatorACDStatuses>();
const changeQueueStatus = createEvent<keyof typeof OperatorACDStatuses>();
const addActiveAudioDevice = createEvent<DropdownOptionProps>();
const addActiveVideoDevice = createEvent<DropdownOptionProps>();
const getDevicesFx = createEffect<null, Devices, void>();
const changeMuteFx = createEffect(setAudioParam);
const changeMute = createEvent<boolean>();
const changeVideoMute = createEvent<boolean>();
const toggleSharingVideo = createEvent<boolean>();
const toggleRemoteSharing = createEvent<boolean>();
const toggleFullScreen = createEvent<boolean>();
const changeSoftphoneParameters = createEvent<{
  micAccessResult?: boolean;
  status?: string;
}>();

const $titleStatus = restore(setTitleStatus, '');
const $queueStatus = createStore<OperatorACDStatuses>(OperatorACDStatuses.Online);
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
});
const $softphoneParameters = createStore<SoftphoneParameters>({
  micAccessResult: false,
  status: '',
});

const changedSettings = $settings.map<number>((store) => {
  return store.mute ? 0 : store.callVolume;
});

export {
  $settings,
  $titleStatus,
  $queueStatus,
  $softphoneParameters,
  getRingtone,
  getAudios,
  setRingtoneParam,
  setTitleStatus,
  setQueueStatus,
  changeVolume,
  changeQueueStatus,
  changedSettings,
  changeMute,
  changeSoftphoneParameters,
  toggleMinimize,
  toggleMaximize,
  addActiveAudioDevice,
  addActiveVideoDevice,
  getDevicesFx,
  changeMuteFx,
  changeVideoMute,
  toggleSharingVideo,
  toggleRemoteSharing,
  toggleFullScreen,
};
