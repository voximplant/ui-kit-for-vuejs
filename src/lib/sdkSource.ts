import * as VoxImplant from 'voximplant-websdk';
import { OperatorACDStatuses } from 'voximplant-websdk';
import { Call } from 'voximplant-websdk/Call/Call';
import { QueueType, SignInFields } from '@/types';
import { EventHandlers } from 'voximplant-websdk/EventHandlers';
import { CallSettings, Config } from 'voximplant-websdk/Structures';
import {
  $calls,
  $currentActiveCallId,
  $currentSelectCallId,
  activeCalls,
  CALL_STATUSES,
  changeCanToggle,
  removeCall,
  setActiveCall,
  setCall,
  setCallDuration,
  setFailedStatus,
  setLastCallNumber,
  setSelectCall,
  toggleRemoteAudio,
  toggleRemotePausedState,
  toggleRemoteVideo,
} from '@/store/calls/index';
import {
  changeComponent,
  openAccessMicrophoneInfo,
  setNotSignInComponent,
} from '@/store/components/index';
import { requestMicrophonePermission } from '@/lib/sdkDevices';
import {
  $settings,
  addActiveAudioDevice,
  addActiveVideoDevice,
  changeSoftphoneParameters,
  changeVideoMute,
  getDevicesFx,
  resetCallDestination,
  resetCallSettings,
  setQueueStatus,
  setRingtoneParam,
  toggleBannedStatus,
  toggleReconnect,
  toggleRemoteSharing,
  toggleSharingVideo,
} from '@/store/settings/index';
import { $isTryRelogin, $signInFields, loginFx, restoreFillForm, setError } from '@/store/signIn';
import { CALL_COMPONENT_NAME } from '@/hooks/callComponentName';
import appConfig from '@/config';
import {
  $notificationState,
  $showNotification,
  NotificationContent,
  setNotificationState,
  toggleNotification,
} from '@/store/notification';
import { MediaRenderer } from 'voximplant-websdk/Media/MediaRenderer';

let LOGIN_ATTEMPTS_QUANTITY = 10;
const RELOGIN_ATTEMPT_PERIOD = 60000; // 1 minute
const sdkClient = VoxImplant.getInstance();
let interval: number;

export const changeVideoParam = (param: boolean): void => {
  sdkClient.showLocalVideo(param);
  changeVideoMute(!param);
};

const handleMessageReceived = (ev: EventHandlers.MessageReceived) => {
  const currentID = $currentActiveCallId.getState();
  const text = JSON.parse(ev.text);
  if (text?.name === 'mute') {
    toggleRemoteAudio({ id: ev.call.settings.id });
  } else if (text?.name === 'initState') {
    // event to set flags on/off media about remote user
    text.audioMute && toggleRemoteAudio({ id: currentID });
    text.videoMute && toggleRemoteVideo({ id: currentID, status: false });
  } else if (text?.name === 'sharing') {
    // remote user toggle sharing state
    toggleRemoteSharing(!$settings.getState().remoteSharing);
  } else if (text?.name === 'setActive') {
    // remote user change call status
    if (
      $currentActiveCallId.getState() === ev.call.settings.id ||
      !$currentActiveCallId.getState()
    ) {
      toggleNotification(!text.isActive);
      setNotificationState('callPause');

      toggleRemotePausedState({ id: ev.call.settings.id, status: !text.isActive });
    } else {
      // if the current user already has an active call, answer that the user is busy
      changeCanToggle({ id: ev.call.settings.id, status: true });
      const data = {
        name: 'userBusy',
      };
      sendTextMessage(JSON.stringify(data), ev.call.settings.id);
    }
  } else if (text?.name === 'userBusy') {
    // processing the response that the remote user is busy
    toggleRemotePausedState({ id: ev.call.settings.id, status: !text.isActive });
    /*toggleActiveSDK(ev.call.settings.id)
      .then((res) => {
        changeCallState(res);
        changeCanToggle({ id: ev.call.settings.id, status: false });
      })
      .catch((err) => console.error('toggleActiveSDK error', err));*/
  }
};

const handleCall = (isIncoming: boolean, call: Call, video?: boolean) => {
  // renderers - storage for media and then rendering them into a div with the remote video element
  const renderers = new Set<MediaRenderer>();
  const id = call.id();

  call.on(VoxImplant.CallEvents.EndpointAdded, (event) => {
    event.endpoint.on(
      VoxImplant.EndpointEvents.RemoteMediaAdded,
      ({ mediaRenderer }: { mediaRenderer: MediaRenderer }) => {
        const toDiv = document.getElementById('remote-video');
        renderers.add(mediaRenderer);
        // add a timeout for rendering the element's divs
        setTimeout(() => {
          renderers.forEach((renderer) => {
            if (toDiv) renderer.render(toDiv);
          });
        }, 200);
        setAudioVolume(call, $settings.getState().callVolume);
        if (mediaRenderer.kind === 'video')
          toggleRemoteVideo({ id: call.settings.id, status: true });
      }
    );
    event.endpoint.on(
      VoxImplant.EndpointEvents.RemoteMediaRemoved,
      ({ mediaRenderer }: { mediaRenderer: MediaRenderer }) => {
        toggleRemoteVideo({ id: call.settings.id, status: false });
        renderers.delete(mediaRenderer);
      }
    );
  });

  call.on(VoxImplant.CallEvents.Connected, ({ call }: EventHandlers.CallEvent) => {
    setCall({ id, call, params: { video } });
    if ($currentActiveCallId.getState() !== id && activeCalls.getState().length > 1) {
      // if the incoming call is not active & the user already has an active call
      toggleActiveSDK(id).catch((err) => console.error('toggleActiveSDK error', err)); // toggle current active call
    } else {
      setActiveCall(id);
    }
    if (isIncoming) {
      setSelectCall(id);
      $settings.getState().ringtone.pause();
    }
    if ($settings.getState().mute || $settings.getState().videoMute) {
      const data = {
        name: 'initState',
        audioMute: $settings.getState().mute,
        videoMute: $settings.getState().videoMute,
      };
      sendTextMessage(JSON.stringify(data));
    }

    if (isIncoming) {
      changeComponent(CALL_COMPONENT_NAME);
      // reset call destination input value
      resetCallDestination();
    }
  });
  call.on(VoxImplant.CallEvents.Disconnected, ({ call }: EventHandlers.CallEvent) => {
    if (isIncoming) $settings.getState().ringtone.pause();
    else setCall({ id, call, params: { video } });

    if (isIncoming && call.settings.id === $currentActiveCallId.getState()) {
      // reset call settings only if it is active now
      resetCallSettings();
    }

    if (call.settings.id === $currentSelectCallId.getState()) {
      changeComponent('CallEnded');
    } else if (call.signalingConnected) {
      // show call ended notification only for already connected call
      toggleNotification(true);
      NotificationContent.pauseCallEnded.number = call.settings.number;
      setNotificationState('pauseCallEnded');
    }
    removeCall(id);

    if (!isIncoming && call.settings.id === $currentActiveCallId.getState()) {
      // reset call settings only if it is active now
      resetCallSettings();
    }
    // disable local video only if there are no active calls left
    if (!$currentActiveCallId.getState()) {
      sdkClient.showLocalVideo(false);
    }
  });

  call.on(VoxImplant.CallEvents.Failed, ({ call, code, reason }: EventHandlers.Failed) => {
    setCall({ id, call, params: { video } });
    setFailedStatus(CALL_STATUSES.includes(`${code}`) ? `${code}` : reason);
    changeComponent('CallEnded');

    if (isIncoming) $settings.getState().ringtone.pause();
    // disable local video only if there are no active calls left
    if (!$currentActiveCallId.getState()) {
      sdkClient.showLocalVideo(false);
    }
    resetCallSettings();
    removeCall(id);
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
  call.on(VoxImplant.CallEvents.MessageReceived, handleMessageReceived);
};

export const createSdkCall = (number: string, video?: boolean): void => {
  if (!isClientLoggedIn()) {
    setNotSignInComponent();
    return;
  }
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
  setLastCallNumber({ number, isVideo: !!video });
  setCall({ id, call, params: { video } });
  setSelectCall(id); // open Call in UI

  changeComponent(CALL_COMPONENT_NAME);
  if (video) changeVideoParam(video);

  resetCallDestination();
  handleCall(false, call, video); // the first flag indicates is it incoming or create call
};

export const toggleActiveSDK = (id: string): Promise<EventHandlers.Updated> => {
  const call = $calls.getState()[id].call;
  const value = !call.active();
  return call.setActive(value);
};

export const sendTone = (char: string): void => {
  const currentCallId = $currentActiveCallId.getState();
  if (currentCallId) {
    const currentCall = $calls.getState()[currentCallId]?.call;
    currentCall.sendTone(char);
  }
};

export const transferSdkCall = (call1: Call, call2: Call): void => {
  if (appConfig.AUDIO_ONLY) sdkClient.transferCall(call1, call2); // transfers work only for audio calls
};

const listenMicAccessResult = (): void => {
  sdkClient.on(VoxImplant.Events.MicAccessResult, onMicAccessResult);
};

const onMicAccessResult = ({ result }: EventHandlers.MicAccessResult): void => {
  changeSoftphoneParameters({ micAccessResult: result });
};

export const setAudioVolume = async (call: Call, volume: number): Promise<void> => {
  call.getEndpoints().forEach((endpoint) =>
    endpoint.mediaRenderers.forEach((mediaRenderer) => {
      if (mediaRenderer.kind === 'audio') {
        mediaRenderer.setVolume(volume);
      }
    })
  );
};

export const setSdkQueueStatus = async (
  status: keyof typeof VoxImplant.OperatorACDStatuses
): Promise<void> => {
  const signInFields = $signInFields.getState();
  const { queueType } = signInFields;
  if (queueType === QueueType.SmartQueue) {
    // for SQ statuses to work, it must be installed after ACD
    await Promise.race([
      sdkClient.setOperatorACDStatus(OperatorACDStatuses[status]), // setOperatorACDStatus (responsible for the readiness of the operator to receive calls)
      sdkClient.setOperatorSQMessagingStatus(OperatorACDStatuses[status]), // setOperatorSQMessagingStatus (responsible for the readiness of the operator to receive messages)
    ])
      .then((res) => setQueueStatus(res))
      .catch((err) => console.error('SQMessaging error', err));
  }
  if (queueType === QueueType.ACD) {
    await sdkClient
      .setOperatorACDStatus(OperatorACDStatuses[status])
      .then((res) => setQueueStatus(res))
      .catch((err) => console.error('ACDStatus error', err));
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

export const sdkLogin = async (params: SignInFields): Promise<void> => {
  const { userName, accountName, applicationName, password, queueType, node, serverIp } = params;
  const loginData = `${userName}@${applicationName}.${accountName}.${node}.voximplant.com`;
  sdkClient.getClientState();

  if (!sdkClient.alreadyInitialized) {
    listenMicAccessResult();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const params: Config = {
      remoteVideoContainerId: 'remote-video',
      localVideoContainerId: 'local-video',
      // use custom QueueType instead SDK QueueTypes, for processing 'None' state
      ...(queueType !== QueueType.None && { queueType: queueType }),
      ...(serverIp && { serverIp }),
    };
    const result = await sdkClient.init(params);
    if (!result) {
      return;
    }
    changeSoftphoneParameters({ status: 'initialized' });
  }
  const checkActiveAudioDevice = await requestMicrophonePermission().catch((e) => {
    console.error('requestMicrophonePermission Error:', e);
    openAccessMicrophoneInfo();
  });
  if (!checkActiveAudioDevice) {
    openAccessMicrophoneInfo();
    return;
  }
  const connect = await sdkClient.connect();
  if (connect) {
    await getDevicesFx(null);
    const settingsStore = $settings.getState();
    if (settingsStore.audioDevices.length) {
      await addActiveAudioDevice({
        label: settingsStore.audioDevices[0].name,
        value: settingsStore.audioDevices[0].id,
      });
    }
    if (settingsStore.videoDevices?.length) {
      await addActiveVideoDevice({
        label: settingsStore.videoDevices[0].name,
        value: settingsStore.videoDevices[0].id,
      });
    }
    setRingtoneParam();
    changeSoftphoneParameters({ status: 'connected' });
  }

  const loginResult = await sdkClient
    .login(loginData, password)
    .then(() => {
      toggleNotification(false);
      return changeComponent('Dialing');
    })
    .catch((e) => {
      switch (e.code) {
        case 404:
          // wrong loginData (userName or accountName, or applicationName)
          setError({ field: 'userName', value: `${e.code}.userName` });
          setError({ field: 'accountName', value: `${e.code}.accountName` });
          setError({ field: 'applicationName', value: `${e.code}.applicationName` });
          break;
        case 401:
          // wrong password
          setError({ field: 'password', value: `${e.code}` });
          break;
        default:
          // other error
          setError({ field: 'notEnough', value: 'Internal error' });
          toggleNotification(true);
          setNotificationState('loginFailed');
      }
    });
  if (!loginResult) return;

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
  const id = call.id();
  const video = Boolean(call.settings.video);
  setLastCallNumber({ number: call.settings.number, isVideo: video });
  setCall({ id, call, params: { video } });

  handleCall(true, call, video); // the first flag indicates is it incoming or create call
});

/* const changeCallState = (value: EventHandlers.Updated) => {
  value.call.settings.active ? setActiveCall(value.call.settings.id) : setActiveCall('');
  changeCanToggle({ id: value.call.settings.id, status: value.call.settings.active });
}; */

sdkClient.on(VoxImplant.Events.ACDStatusUpdated, (status) => {
  if (status.status === 'BANNED') toggleBannedStatus(true);
  if (status.status !== 'BANNED') toggleBannedStatus(false);
  setQueueStatus(status.status);
});

// attempt to login in after losing connection
const loginAfterConnectionClosed = () => {
  restoreFillForm();
  loginFx({})
    .then(() => {
      toggleReconnect(false);
    })
    .catch(() => {
      if (LOGIN_ATTEMPTS_QUANTITY) {
        setTimeout(() => loginAfterConnectionClosed(), RELOGIN_ATTEMPT_PERIOD);
        LOGIN_ATTEMPTS_QUANTITY--;
      } else {
        setNotSignInComponent();
        toggleReconnect(false);
      }
    });
};

sdkClient.on(VoxImplant.Events.ConnectionClosed, () => {
  if ($isTryRelogin.getState()) {
    // try to re-login if the user at the entrance set "remember me"
    setTimeout(() => loginAfterConnectionClosed(), RELOGIN_ATTEMPT_PERIOD);
  } else {
    // show session expired notification only if user has active reconnecting state
    if ($notificationState.getState() === 'reconnecting' && $showNotification.getState()) {
      setTimeout(() => {
        setNotificationState('sessionExpired');
        toggleNotification(true);
      });
    }
    toggleReconnect(false);
  }
});

sdkClient.on(VoxImplant.Events.Reconnecting, () => {
  toggleReconnect(true);
});

sdkClient.on(VoxImplant.Events.Reconnected, () => {
  toggleReconnect(false);
});

export const sendTextMessage = (text: string, callId?: string | undefined): void => {
  const currentCallID = callId ?? $currentSelectCallId.getState();
  if (currentCallID) {
    const currentCall = sdkClient.getCall(currentCallID);
    if (currentCall) currentCall.sendMessage(text);
  }
};

export const videoSharingStopListener = (): void => {
  const renderer = VoxImplant.Hardware.StreamManager.get().getLocalMediaRenderers()[0];
  // when user start screen sharing without local video, MediaRenderer have kind === video
  if (renderer.kind === 'sharing' || renderer.kind === 'video') {
    renderer.stream.getTracks().forEach((videoTrack) => {
      videoTrack.onended = () => {
        renderer.kind === 'video' && changeVideoParam(false); // disable local video when user start screen sharing without local video
        toggleSharingVideo(false); // UI change to layout on without screen sharing
        const textMessage = {
          name: 'sharing',
          status: false,
        };
        sendTextMessage(JSON.stringify(textMessage)); // send screen sharing end events
      };
    });
  }
};

export const isClientLoggedIn = (): boolean => {
  const isLogin = sdkClient.getClientState();
  return isLogin === VoxImplant.ClientState.LOGGED_IN;
};
