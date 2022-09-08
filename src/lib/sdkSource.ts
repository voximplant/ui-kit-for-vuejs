import * as VoxImplant from 'voximplant-websdk';
import { OperatorACDStatuses } from 'voximplant-websdk';
import { Call } from 'voximplant-websdk/Call/Call';
import { QueueType, SignInFields } from '@/types';
import { EventHandlers } from 'voximplant-websdk/EventHandlers';
import { CallSettings, Config } from 'voximplant-websdk/Structures';
import {
  $calls,
  $currentActiveCallId,
  currentActiveCall,
  removeCall,
  setActiveCall,
  setAllCallAsPaused,
  setCall,
  setCallDuration,
  setFailedStatus,
  setLastCallNumber,
  toggleRemoteAudio,
  toggleRemoteVideo,
} from '@/store/calls/index';
import {
  changeComponent,
  changeComponentDialingStatus,
  changeComponentInfoStatus,
} from '@/store/components/index';
import { requestMicrophonePermission } from '@/lib/sdkDevices';
import {
  $settings,
  addActiveAudioDevice,
  addActiveVideoDevice,
  changedSettings,
  changeSoftphoneParameters,
  changeVideoMute,
  getAudios,
  getDevicesFx,
  setQueueStatus,
  setRingtoneParam,
  toggleRemoteSharing,
} from '@/store/settings/index';
import { $signInFields, setError } from '@/store/signIn';
import { useStore } from 'effector-vue/composition';

const sdkClient = VoxImplant.getInstance();
let interval: number;

export const changeVideoParam = (param: boolean): void => {
  sdkClient.showLocalVideo(param);
  changeVideoMute(!param);
};

export const createSdkCall = (number: string, video?: boolean): void => {
  const useVideo = {
    sendVideo: Boolean(video),
    receiveVideo: Boolean(video),
  };
  const callSettings: CallSettings = {
    number,
    video: useVideo,
  };
  const call = sdkClient.call(callSettings);
  const id = call.id();
  setLastCallNumber(number);
  setCall({ id, call, params: { video } });
  setActiveCall(id);
  if (video) {
    changeComponent('VideoCall');
    if (!$settings.getState().videoMute) changeVideoParam(true);
  } else {
    changeComponent('Call');
  }
  const renderers = new Set<{ render: (el: HTMLElement | null) => void }>();
  const currentCallId = useStore($currentActiveCallId);
  call.on(VoxImplant.CallEvents.EndpointAdded, (event) => {
    event.endpoint.on(
      VoxImplant.EndpointEvents.RemoteMediaAdded,
      ({ mediaRenderer }: { mediaRenderer: { render: (el: HTMLElement | null) => void } }) => {
        const toDiv = document.getElementById('remote-video');
        renderers.add(mediaRenderer);
        setTimeout(() => {
          renderers.forEach((renderer) => renderer.render(toDiv));
        }, 200);
        toggleRemoteVideo({ id: currentCallId.value, status: true });
      }
    );
    event.endpoint.on(
      VoxImplant.EndpointEvents.RemoteMediaRemoved,
      ({ mediaRenderer }: { mediaRenderer: { render: (el: HTMLElement | null) => void } }) => {
        toggleRemoteVideo({ id: currentCallId.value, status: false });
        renderers.delete(mediaRenderer);
      }
    );
  });
  call.on(VoxImplant.CallEvents.Connected, ({ call }: EventHandlers.CallEvent) => {
    setCall({ id, call, params: { video } });
    //if (!$settings.getState().videoMute) changeVideoParam(true);
    if ($settings.getState().mute || $settings.getState().videoMute) {
      const data = {
        name: 'initState',
        audioMute: $settings.getState().mute,
        videoMute: $settings.getState().videoMute,
      };
      sendTextMessage(JSON.stringify(data));
    }
  });
  call.on(VoxImplant.CallEvents.Disconnected, ({ call }: EventHandlers.CallEvent) => {
    setCall({ id, call, params: { video } });
    //changeVideoParam(false);
    sdkClient.showLocalVideo(false);
    setTimeout(() => {
      removeCall(id);
      changeComponent('Dialing');
    }, 3000);
    toggleRemoteSharing(false);
  });
  call.on(VoxImplant.CallEvents.Failed, ({ call, code }: EventHandlers.Failed) => {
    setCall({ id, call, params: { video } });
    setFailedStatus(`${code}`);
    //changeVideoParam(false);
    sdkClient.showLocalVideo(false);
    setTimeout(() => {
      removeCall(id);
      changeComponent('Dialing');
    }, 4000);
    toggleRemoteSharing(false);
  });
  call.on(
    VoxImplant.CallEvents.ActiveUpdated,
    ({ call, new: newValue }: EventHandlers.ActiveUpdated) => {
      if (newValue) {
        setActiveCall(id);
      }
      setCall({ id, call, params: { video } });
    }
  );
  call.on(VoxImplant.CallEvents.MessageReceived, (ev) => {
    const currentID = $currentActiveCallId.getState();
    const text = JSON.parse(ev.text);
    if (text?.name === 'mute') {
      toggleRemoteAudio({ id: currentID });
    } else if (text?.name === 'initState') {
      text.audioMute && toggleRemoteAudio({ id: currentID });
      text.videoMute && toggleRemoteVideo({ id: currentID, status: false });
    } else if (text?.name === 'sharing') {
      toggleRemoteSharing(!$settings.getState().remoteSharing);
    }
  });
};

export const sendTone = (char: string): void => {
  const currentCallId = currentActiveCall.getState()?.id;
  if (currentCallId) {
    const currentCall = $calls.getState()[currentCallId]?.call;
    currentCall.sendTone(char);
  }
};

export const transferSdkCall = (call1: Call, call2: Call): void => {
  sdkClient.transferCall(call1, call2);
};

const listenMicAccessResult = (): void => {
  sdkClient.on(VoxImplant.Events.MicAccessResult, onMicAccessResult);
};

const onMicAccessResult = ({ result }: EventHandlers.MicAccessResult): void => {
  changeSoftphoneParameters({ micAccessResult: result });
};

export const setAudioParam = async (): Promise<void> => {
  getAudios();
  const audioList = $settings.getState().audios;
  if (audioList.length > 0) {
    for (const audio of audioList) {
      audio.volume = changedSettings.getState();
    }
  }
};

export const setSdkQueueStatus = async (
  status: keyof typeof VoxImplant.OperatorACDStatuses
): Promise<void> => {
  const signInFields = $signInFields.getState();
  const { queueType } = signInFields;
  let result;
  if (queueType === QueueType.SmartQueue) {
    result = await sdkClient.setOperatorSQMessagingStatus(OperatorACDStatuses[status]);
  }
  if (queueType === QueueType.ACD) {
    result = await sdkClient.setOperatorACDStatus(OperatorACDStatuses[status]);
  }
  if (result) {
    setQueueStatus(result);
  }
};

const getSdkQueueStatus = async () => {
  const signInFields = $signInFields.getState();
  const { queueType } = signInFields;
  let result = OperatorACDStatuses.Online;
  if (queueType === QueueType.SmartQueue) {
    result = await sdkClient.getOperatorSQMessagingStatus();
  }
  if (queueType === QueueType.ACD) {
    result = await sdkClient.getOperatorACDStatus();
  }
  setQueueStatus(result);
};

export const sdkLogin = async (params: SignInFields) => {
  const { userName, accountName, applicationName, password, queueType } = params;
  const loginData = `${userName}@${applicationName}.${accountName}.voximplant.com`;
  sdkClient.getClientState();

  if (!sdkClient.alreadyInitialized) {
    listenMicAccessResult();
    //TODO поправить QueueType

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const params: Config = {
      remoteVideoContainerId: 'remote-video',
      localVideoContainerId: 'local-video',
      ...(queueType !== QueueType.None && { queueType: queueType }),
    };
    const result = await sdkClient.init(params);
    if (!result) {
      return false;
    }
    changeSoftphoneParameters({ status: 'initialized' });
  }
  const checkActiveAudioDevice = await requestMicrophonePermission();
  const connect = await sdkClient.connect();
  if (!checkActiveAudioDevice) {
    changeComponent('Info');
    changeComponentInfoStatus('accessMicrophone');
  }
  if (connect) {
    await getDevicesFx(null);
    await addActiveAudioDevice({
      label: $settings.getState().audioDevices[0].name,
      value: $settings.getState().audioDevices[0].id,
    });
    await addActiveVideoDevice({
      label: $settings.getState().videoDevices[0].name,
      value: $settings.getState().videoDevices[0].id,
    });
    setRingtoneParam();
    changeSoftphoneParameters({ status: 'connected' });
  }

  await sdkClient
    .login(loginData, password)
    .then(() => changeComponent('Dialing'))
    .catch((e) => {
      switch (e.code) {
        case 404:
          // wrong username
          setError({ field: 'userName', value: 'Incorrect user name' });
          break;
        case 401:
          // wrong password
          setError({ field: 'password', value: 'Incorrect password' });
          break;
        default:
          // other error
          setError({ field: 'notEnough', value: 'Internal error' });
      }
    });

  await getSdkQueueStatus();
  interval = window.setInterval(() => {
    setCallDuration();
  }, 1000);
};

export const logout = (): Promise<void> => {
  clearInterval(interval);
  return sdkClient.disconnect();
};

sdkClient.on(VoxImplant.Events.IncomingCall, ({ call }: EventHandlers.IncomingCall) => {
  $settings.getState().ringtone.play();
  setLastCallNumber(call.settings.number);
  const id = call.id();
  const video = Boolean(call.settings.video);
  setCall({ id, call, params: { video } });
  const renderers = new Set<{ render: (el: HTMLElement | null) => void }>();
  const currentCallId = useStore($currentActiveCallId);
  call.on(VoxImplant.CallEvents.EndpointAdded, (event) => {
    event.endpoint.on(
      VoxImplant.EndpointEvents.RemoteMediaAdded,
      ({ mediaRenderer }: { mediaRenderer: { render: (el: HTMLElement | null) => void } }) => {
        const toDiv = document.getElementById('remote-video');
        renderers.add(mediaRenderer);
        setTimeout(() => {
          renderers.forEach((renderer) => renderer.render(toDiv));
        }, 200);
        toggleRemoteVideo({ id: currentCallId.value, status: true });
      }
    );
    event.endpoint.on(
      VoxImplant.EndpointEvents.RemoteMediaRemoved,
      ({ mediaRenderer }: { mediaRenderer: { render: (el: HTMLElement | null) => void } }) => {
        toggleRemoteVideo({ id: currentCallId.value, status: false });
        renderers.delete(mediaRenderer);
      }
    );
  });
  call.on(VoxImplant.CallEvents.Connected, ({ call }: EventHandlers.IncomingCall) => {
    setAllCallAsPaused(id);
    setCall({ id, call, params: { video } });
    setActiveCall(id);
    $settings.getState().ringtone.pause();
    if ($settings.getState().mute || $settings.getState().videoMute) {
      const data = {
        name: 'initState',
        audioMute: $settings.getState().mute,
        videoMute: $settings.getState().videoMute,
      };
      sendTextMessage(JSON.stringify(data));
    }
    if (video) {
      changeComponent('VideoCall');
    } else {
      changeComponent('Call');
    }
    /*setTimeout(() => {
      const toDiv = document.getElementById('remote-video');
      renderers.forEach((renderer) => renderer.render(toDiv));
      call.getEndpoints().forEach((ep) => ep.off(VoxImplant.EndpointEvents.RemoteMediaAdded));
    }, 200);*/
  });
  call.on(VoxImplant.CallEvents.Disconnected, () => {
    $settings.getState().ringtone.pause();
    removeCall(id);
    sdkClient.showLocalVideo(false);
    changeComponent('Dialing');
    changeComponentDialingStatus('firstCall');
    toggleRemoteSharing(false);
  });
  call.on(VoxImplant.CallEvents.Failed, ({ call }: EventHandlers.Failed) => {
    setCall({ id, call, params: { video } });
    $settings.getState().ringtone.pause();
    sdkClient.showLocalVideo(false);
    removeCall(id);
    toggleRemoteSharing(false);
  });
  call.on(
    VoxImplant.CallEvents.ActiveUpdated,
    ({ call, new: newValue }: EventHandlers.ActiveUpdated) => {
      if (newValue) {
        setActiveCall(id);
      }
      setCall({ id, call, params: { video } });
    }
  );
  call.on(VoxImplant.CallEvents.MessageReceived, (ev: any) => {
    const currentID = $currentActiveCallId.getState();
    const text = JSON.parse(ev.text);
    if (text?.name === 'mute') {
      toggleRemoteAudio({ id: currentID });
    } else if (text?.name === 'initState') {
      text.audioMute && toggleRemoteAudio({ id: currentID });
      text.videoMute && toggleRemoteVideo({ id: currentID, status: false });
    } else if (text?.name === 'sharing') {
      toggleRemoteSharing(!$settings.getState().remoteSharing);
    }
  });
});

sdkClient.on(VoxImplant.Events.ACDStatusUpdated, (status) => {
  setQueueStatus(status.status);
});

export const sendTextMessage = (text: string): void => {
  const currentCallID = useStore($currentActiveCallId);
  if (currentCallID.value) {
    const currentCall = sdkClient.getCall(currentCallID.value);
    if (currentCall) currentCall.sendMessage(text);
  }
};
