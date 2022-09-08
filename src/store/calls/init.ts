import { createSdkCall, sendTextMessage, setAudioParam, transferSdkCall } from '@/lib/sdkSource';
import {
  changeComponent,
  changeComponentDialingStatus,
  changeComponentInfoStatus,
} from '@/store/components/index';
import {
  $callDuration,
  $calls,
  $currentActiveCallId,
  answerIncomingCall,
  changeAudioDevice,
  changeLastTransferredCallNumbers,
  changeVideoDevice,
  createCall,
  currentActiveCall,
  hangUp,
  openCallState,
  removeCall,
  setActiveCall,
  setAllCallAsPaused,
  setCall,
  setCallDuration,
  setFailedStatus,
  toggleCallActive,
  toggleLocalVideo,
  toggleRemoteAudio,
  toggleRemoteVideo,
  toggleRemoteSharingVideo,
  transferCall,
} from '@/store/calls/index';
import { sample } from 'effector';
import { changeAudio, changeVideo } from '@/lib/sdkDevices';
import { toggleRemoteSharing } from '@/store/settings';

$calls.on(createCall, (store, { number, video }) => {
  setAllCallAsPaused();
  createSdkCall(number, video);
});

$calls.on(hangUp, (store, { id, incoming }) => {
  const currentCall = store[id]?.call;
  currentCall?.hangup();
  if (!incoming) {
    changeComponent('Dialing');
    changeComponentDialingStatus('firstCall');
  }
  toggleRemoteSharing(false);
});

$calls.on(answerIncomingCall, (store, { id, isVideo }) => {
  const currentCall = store[id];
  if (currentCall.params.video) {
    changeComponent('VideoCall');
    currentCall.call &&
      currentCall.call.answer(
        '',
        {},
        {
          sendVideo: isVideo,
          receiveVideo: true,
        }
      );
  } else {
    currentCall.call.answer();
  }
  return { ...store };
});

$calls.on(setCall, (store, { id, call, params }) => {
  const { video, muted } = params;
  return {
    ...store,
    [id]: {
      call,
      params: {
        video: Boolean(video),
        muted: Boolean(muted),
        remoteVideo: true,
      },
    },
  };
});

$calls.on(removeCall, (store, id) => {
  delete store[id];
  return { ...store };
});

$calls.on(transferCall, (store, id) => {
  const transferCall = store[id]?.call;
  const activeCallId = $currentActiveCallId.getState();
  const activeCall = store[activeCallId]?.call;

  if (transferCall && activeCall) {
    toggleCallActive({ id: activeCallId });
    transferSdkCall(activeCall, transferCall);
    toggleCallActive({ id: activeCallId, value: true });
    changeComponent('Info');
    changeComponentInfoStatus('transferredCall');
    changeLastTransferredCallNumbers({
      number1: activeCall.number(),
      number2: transferCall.number(),
    });
  }
  return store;
});

$calls.on(toggleCallActive, (store, payload) => {
  const call = store[payload.id].call;
  const value = payload.value ?? !call.active();
  call.setActive(value);
});

$calls.on(toggleLocalVideo, (store, { id, status }) => {
  const call = store[id]?.call;
  call?.sendVideo(status);
});

$calls.on(toggleRemoteSharingVideo, (store, { id, status }) => {
  const call = store[id]?.call;
  const data = {
    name: 'sharing',
    status,
  };
  sendTextMessage(JSON.stringify(data));
  status ? call?.shareScreen(true) : call?.stopSharingScreen();
  return { ...store };
});

$calls.on(toggleRemoteAudio, (store, { id }) => {
  const callParams = store[id]?.params;
  callParams.muted = !callParams.muted;
  return { ...store };
});

$calls.on(toggleRemoteVideo, (store, { id, status }) => {
  const callParams = store[id]?.params;
  if (callParams) callParams.remoteVideo = status;
  return { ...store };
});

$calls.on(setAllCallAsPaused, (store, id) => {
  const calls = Object.keys(store);
  for (const call of calls) {
    if (call !== id) {
      toggleCallActive({ id: call, value: false });
    }
  }
});

$calls
  .on(changeAudioDevice, (store, inputId) => {
    const activeCall = store[$currentActiveCallId.getState()];
    if (activeCall) changeAudio(activeCall.call, inputId);
  })
  .on(changeVideoDevice, (store, inputId) => {
    const activeCall = store[$currentActiveCallId.getState()];
    if (activeCall) changeVideo(activeCall.call, inputId);
  });

$calls.on(openCallState, (store, id) => {
  let isVideoCall = false;
  if (id) {
    isVideoCall = store[id].params.video;
  }
  changeComponent(isVideoCall ? 'VideoCall' : 'Call');
});

$calls.watch(async () => {
  await setAudioParam();
});

$callDuration.on(setCallDuration, (store) => {
  const calls = $calls.getState();
  const activeCalls = Object.entries(calls);
  return activeCalls.reduce((acc, [id, { call }]) => {
    let pauseDuration = store[id]?.pauseDuration || 0;
    if (!call.active()) {
      pauseDuration += 1000;
    } else {
      pauseDuration = 0;
    }

    const duration = call.getCallDuration();
    const callDuration = isNaN(duration) ? store[id]?.duration : duration;
    return {
      ...acc,
      [id]: {
        callDuration,
        pauseDuration,
      },
    };
  }, {});
});

currentActiveCall.on(setFailedStatus, (store, payload) => {
  if (!store) return;
  return { ...store, status: payload };
});

sample({
  clock: setActiveCall,
  source: $currentActiveCallId,
  target: openCallState,
});
