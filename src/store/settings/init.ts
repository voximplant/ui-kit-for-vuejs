import { changeMicrophone, getAudioDevices, getVideoDevices } from '@/lib/sdkDevices';
import { Settings, SoftphoneParameters } from '@/types';
import {
  $queueStatus,
  $settings,
  $softphoneParameters,
  addActiveAudioDevice,
  addActiveVideoDevice,
  changeMute,
  changeMuteFx,
  changeQueueStatus,
  changeSoftphoneParameters,
  changeVideoMute,
  changeVolume,
  getAudios,
  getDevicesFx,
  getRingtone,
  setQueueStatus,
  setRingtoneParam,
  toggleFullScreen,
  toggleMaximize,
  toggleMinimize,
  toggleRemoteSharing,
  toggleSharingVideo,
} from '@/store/settings/index';
import { sendTextMessage, setSdkQueueStatus } from '@/lib/sdkSource';
import { AudioSourceInfo, VideoSourceInfo } from 'voximplant-websdk/Structures';
import { $currentComponent, changeComponent } from '@/store/components';
import { sample } from 'effector';

export interface Devices {
  audio: AudioSourceInfo[];
  video: VideoSourceInfo[];
}

getDevicesFx.use(
  async (): Promise<Devices> => {
    return {
      audio: await getAudioDevices(),
      video: await getVideoDevices(),
    };
  }
);

$softphoneParameters.on(
  changeSoftphoneParameters,
  (store: SoftphoneParameters, payload: SoftphoneParameters) => ({
    ...store,
    ...payload,
  })
);

$settings.on(
  changeVolume,
  (store: Settings, payload: { callVolume?: number; ringtoneVolume?: number }) => {
    return {
      ...store,
      ...payload,
    };
  }
);

$settings.on(getAudios, (store) => {
  const audios = document.getElementsByTagName('audio');
  return {
    ...store,
    audios: Array.from(audios).slice(1),
  };
});

$settings.on(getRingtone, (store) => {
  return {
    ...store,
    ringtone: document.getElementById('ringtone') as HTMLAudioElement,
  };
});

$settings.on(setRingtoneParam, (store) => {
  getRingtone();
  const ringtone = store.ringtone;
  if (ringtone) {
    ringtone.volume = store.ringtoneVolume;
  }
});

$settings.on(getDevicesFx.doneData, (store, payload: Devices) => {
  return { ...store, audioDevices: payload.audio, videoDevices: payload.video };
});

$settings.on(toggleMinimize, (store) => {
  const currentComponent = $currentComponent.getState();
  if (['Settings', 'Info'].includes(currentComponent)) {
    changeComponent('Dialing');
  }

  return {
    ...store,
    minimize: !store.minimize,
    maximize: false,
  };
});

$settings.on(toggleMaximize, (store) => {
  const currentComponent = $currentComponent.getState();
  if (['Settings', 'Info'].includes(currentComponent)) {
    changeComponent('Dialing');
  }

  return {
    ...store,
    minimize: false,
    maximize: !store.maximize,
  };
});

$settings
  .on(addActiveAudioDevice, (store, payload) => {
    changeMicrophone(payload.value as string);
    return { ...store, activeAudioDevice: payload };
  })
  .on(addActiveVideoDevice, (store, payload) => {
    return { ...store, activeVideoDevice: payload };
  });

$queueStatus.on(changeQueueStatus, (store, status) => {
  setSdkQueueStatus(status);
});

$queueStatus.on(setQueueStatus, (store, status) => status);

$settings.on(changeMute, (store, payload) => {
  const data = {
    name: 'mute',
  };
  sendTextMessage(JSON.stringify(data));
  return {
    ...store,
    mute: payload,
  };
});

sample({
  clock: changeMute,
  target: changeMuteFx,
});

$settings.on(changeVideoMute, (store, payload) => {
  return {
    ...store,
    videoMute: payload,
  };
});

$settings
  .on(toggleSharingVideo, (store, status) => {
    return {
      ...store,
      sharing: status,
    };
  })
  .on(toggleRemoteSharing, (store, status) => {
    return { ...store, remoteSharing: status };
  });

$settings.on(toggleFullScreen, (store, status) => {
  return {
    ...store,
    fullscreen: status,
  };
});
