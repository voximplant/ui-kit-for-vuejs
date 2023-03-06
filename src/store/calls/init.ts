import {
  createSdkCall,
  sendTextMessage,
  toggleActiveSDK,
  transferSdkCall,
  videoSharingStopListener,
  changeVideoParam,
} from '@/lib/sdkSource';
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
  hangUp,
  openCallState,
  removeCall,
  setCurrentCallAsPaused,
  setCall,
  setCallDuration,
  setFailedStatus,
  toggleCallActive,
  toggleLocalVideo,
  toggleRemoteAudio,
  toggleRemoteVideo,
  toggleRemoteSharingVideo,
  transferCall,
  currentSelectCall,
  setSelectCall,
  $currentSelectCallId,
  changeCanToggle,
  toggleRemotePausedState,
} from '@/store/calls/index';
import { sample } from 'effector';
import { changeAudio, changeVideo } from '@/lib/sdkDevices';
import { $settings, resetCallDestination, toggleSharingVideo } from '@/store/settings';
import { EventHandlers } from 'voximplant-websdk/EventHandlers';
import { CALL_COMPONENT_NAME } from '@/hooks/callComponentName';

// call handling events
$calls.on(createCall, (store, { number, video }) => {
  if ($currentActiveCallId.getState()) {
    // stop the current active call, then create a new one
    setCurrentCallAsPaused({})
      .then(() => createSdkCall(number, video))
      .catch((err) => console.error('setCurrentCallAsPaused error', err));
  } else {
    createSdkCall(number, video);
  }
});

$calls.on(hangUp, (store, { id }) => {
  const currentCall = store[id]?.call;
  currentCall?.hangup();
  resetCallDestination();
});

$calls.on(answerIncomingCall, (store, { id, isVideo }) => {
  const currentCall = store[id];
  if (currentCall.params.video) {
    changeComponent(CALL_COMPONENT_NAME);
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
  return {
    ...store,
    [id]: {
      call,
      params: {
        video: !!params.video,
        muted: !!params.muted,
        remoteVideo: store[id]?.params.remoteVideo,
        canToggleActive: true,
        remotePausedState: store[id] ? store[id].params.remotePausedState : false,
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
    transferSdkCall(transferCall, activeCall);
    toggleCallActive({ id: activeCallId });
    changeComponent('Info');
    changeComponentInfoStatus('transferredCall');
    changeLastTransferredCallNumbers({
      number1: activeCall.number(),
      number2: transferCall.number(),
    });
  }
  return store;
});

$calls.on(changeCanToggle, (store, { id, status }) => {
  const callParams = store[id]?.params;
  callParams.canToggleActive = status ?? !callParams.canToggleActive;
  return { ...store };
});

// Effect that changes the state of the call in the SDK
toggleCallActive.use(async (params) => {
  return toggleActiveSDK(params.id);
});

setCurrentCallAsPaused.use(() => {
  const currentCallId = $calls.getState()[$currentActiveCallId.getState()]?.call.id();
  toggleRemoteVideo({ id: currentCallId, status: false });
  return toggleCallActive({ id: currentCallId });
});

$currentActiveCallId.on(toggleCallActive.doneData, (store, ev: EventHandlers.Updated) => {
  const data = {
    name: 'setActive',
    isActive: ev.call.settings.active,
  };
  sendTextMessage(JSON.stringify(data), ev.call.settings.id);
  return ev.call.settings.active ? ev.call.settings.id : '';
});

// set new active call to selected for open in UI
$currentActiveCallId.watch((state) => {
  if (state) setSelectCall(state);
  else toggleRemoteVideo({ id: state, status: false });
});

// event that changes media call settings
$calls.on(toggleLocalVideo, (store, { id, status }) => {
  const call = store[id]?.call;
  call?.sendVideo(status);
});

let needEnableVideo = true; // show local video after stopped sharing video as default
$calls.on(toggleRemoteSharingVideo, (store, { id, status }) => {
  const call = store[id]?.call;
  const textMessage = {
    name: 'sharing',
    status,
  };
  if (status) {
    call
      ?.shareScreen(true)
      .then((data) => {
        if (data.result) {
          if ($settings.getState().videoMute) {
            changeVideoParam(true); // display local video div for SDK replaces local video with sharing
            needEnableVideo = false; // set false a flag on enable local video after stopping sharing
          }
          toggleSharingVideo(status);
          sendTextMessage(JSON.stringify(textMessage));
          videoSharingStopListener(); // change UI when user stopped video sharing by browser window
        }
      })
      .catch((err) => console.error('shareScreen error', err));
  } else {
    changeVideoParam(needEnableVideo); // return the display of local video div, as it was before sharing
    needEnableVideo = true; // reset param
    call
      ?.stopSharingScreen()
      .then((data) => {
        if (data.result) {
          toggleSharingVideo(status);
          sendTextMessage(JSON.stringify(textMessage));
        }
      })
      .catch((err) => console.error('stopSharingScreen error', err));
  }
  return { ...store };
});

$calls
  .on(toggleRemoteAudio, (store, { id }) => {
    const callParams = store[id]?.params;
    callParams.muted = !callParams.muted;
    return { ...store };
  })
  .on(toggleRemoteVideo, (store, { id, status }) => {
    const callParams = store[id]?.params;
    if (callParams) callParams.remoteVideo = status;
    return { ...store };
  })
  .on(toggleRemotePausedState, (store, { id, status }) => {
    const callParams = store[id]?.params;
    if (callParams) callParams.remotePausedState = status;
    return { ...store };
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

// events that change the state of calls and its display
$calls.on(openCallState, (store, id) => {
  if (!store[id]) {
    changeComponent('Dialing');
    changeComponentDialingStatus('firstCall');
  } else {
    changeComponent(CALL_COMPONENT_NAME);
  }
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
    const callDuration = isNaN(duration) ? store[id]?.callDuration : duration;
    return {
      ...acc,
      [id]: {
        callDuration,
        pauseDuration,
      },
    };
  }, {});
});

currentSelectCall.on(setFailedStatus, (store, payload) => {
  if (!store) return;
  return { ...store, status: payload };
});

sample({
  clock: setSelectCall,
  source: $currentSelectCallId,
  target: openCallState,
});
