import { changeMicrophone, getAudioDevices, getVideoDevices } from '@/lib/sdkDevices';
import { Settings, SoftphoneParameters } from '@/types';
import {
  $isBannedStatus,
  $queueStatus,
  $settings,
  $softphoneParameters,
  addActiveAudioDevice,
  addActiveVideoDevice,
  changeMute,
  changeQueueStatus,
  changeSoftphoneParameters,
  changeVideoMute,
  changeVolume,
  getDevicesFx,
  getRingtone,
  setQueueStatus,
  setRingtoneParam,
  toggleBannedStatus,
  toggleFullScreen,
  toggleMaximize,
  toggleMinimize,
  toggleReconnect,
  toggleRemoteSharing,
  toggleSharingVideo,
  toggleShowPauseNotification,
} from '@/store/settings/index';
import { sendTextMessage, setAudioVolume, setSdkQueueStatus } from '@/lib/sdkSource';
import { AudioSourceInfo, VideoSourceInfo } from 'voximplant-websdk/Structures';
import { $currentComponent, changeComponent } from '@/store/components';
import { guard, sample } from 'effector';
import { $calls, $currentSelectCallId } from '@/store/calls';
import appConfig from '@/config';
import { setNotificationState, toggleNotification } from '@/store/notification';

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
  }
  interface HTMLElement {
    msRequestFullscreen?: () => Promise<void>;
    mozRequestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  }
}

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
  }
  interface HTMLElement {
    msRequestFullscreen?: () => Promise<void>;
    mozRequestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  }
}

export interface Devices {
  audio: AudioSourceInfo[];
  video?: VideoSourceInfo[];
}

// the effect of getting access to the user's devices
getDevicesFx.use(
  async (): Promise<Devices> => {
    return appConfig.AUDIO_ONLY
      ? {
          audio: await getAudioDevices(),
        }
      : {
          audio: await getAudioDevices(),
          video: await getVideoDevices(),
        };
  }
);

$settings.on(getDevicesFx.doneData, (store, payload: Devices) => {
  return { ...store, audioDevices: payload.audio, videoDevices: payload.video };
});

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

$settings
  .on(getRingtone, (store) => {
    return {
      ...store,
      ringtone: document.getElementById('ringtone') as HTMLAudioElement,
    };
  })
  .on(setRingtoneParam, (store) => {
    getRingtone();
    const ringtone = store.ringtone;
    if (ringtone) {
      ringtone.volume = store.ringtoneVolume;
    }
  });

$settings
  .on(toggleMinimize, (store) => {
    const currentComponent = $currentComponent.getState();
    if (['Settings', 'Info'].includes(currentComponent)) {
      changeComponent('Dialing');
    }

    return {
      ...store,
      minimize: !store.minimize,
      maximize: false,
    };
  })
  .on(toggleMaximize, (store) => {
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

$queueStatus
  .on(changeQueueStatus, (store, status) => {
    setSdkQueueStatus(status);
  })
  .on(setQueueStatus, (store, status) => status);

$isBannedStatus.on(toggleBannedStatus, (store, status) => status);

// media event
$settings
  .on(changeMute, (store, isMute) => {
    const currentCall = $calls.getState()[$currentSelectCallId.getState()]?.call;
    if (currentCall) {
      if (isMute) currentCall.muteMicrophone();
      else currentCall.unmuteMicrophone();
      // send message about mute https://voximplant.com/docs/references/websdk/voximplant/call#sendmessage
      const data = {
        name: 'mute',
      };
      sendTextMessage(JSON.stringify(data));
    }

    return {
      ...store,
      mute: isMute,
    };
  })
  .on(changeVideoMute, (store, payload) => {
    return {
      ...store,
      videoMute: payload,
    };
  });

// events that toggle the state of softphone settings
$settings
  .on(toggleSharingVideo, (store, status) => {
    return {
      ...store,
      sharing: status,
    };
  })
  .on(toggleRemoteSharing, (store, status) => {
    return { ...store, remoteSharing: status };
  })
  .on(toggleFullScreen, (store, status) => {
    return {
      ...store,
      fullscreen: status,
    };
  })
  .on(toggleReconnect, (store, status) => {
    toggleNotification(status);
    setNotificationState('reconnecting');
    return {
      ...store,
      reconnect: status,
    };
  })
  .on(toggleShowPauseNotification, (store, status) => {
    return {
      ...store,
      showPauseNotification: status,
    };
  });

let haveScreenlister = false;
const changeFullScreen = (status: boolean) => {
  if (status) {
    if (!haveScreenlister) {
      addEventListener('fullscreenchange', () => {
        // for catch Escape key press and change styles when full screen exit
        haveScreenlister = true;
        if (!document.fullscreenElement) toggleFullScreen(false);
      });
    }

    const videoElement = document.getElementById('video-container');
    if (!videoElement) return;
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.mozRequestFullscreen) {
      videoElement.mozRequestFullscreen(); // for Mozilla
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen(); // for Safari
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen(); // for Mozilla
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen(); // for Safari
    }
  }
};

const targetFullScreen = sample({
  clock: toggleFullScreen,
});

targetFullScreen.watch(changeFullScreen);

const changeCallVolumeGuard = guard({
  source: changeVolume,
  filter: ({ callVolume }) => {
    return typeof callVolume === 'number';
  },
});

sample({
  clock: changeCallVolumeGuard,
  source: [$settings, $calls],
  fn([{ callVolume }, calls]) {
    Object.values(calls).forEach(({ call }) => {
      setAudioVolume(call, callVolume);
    });
  },
});

const changeRingtoneVolumeGuard = guard({
  source: changeVolume,
  filter: ({ ringtoneVolume }) => {
    return typeof ringtoneVolume === 'number';
  },
});

sample({
  clock: changeRingtoneVolumeGuard,
  target: setRingtoneParam,
});
