import { combine, createEffect, createEvent, createStore, restore } from 'effector';
import { Call } from 'voximplant-websdk/Call/Call';
import { ActiveCall, DurationStore } from '@/types';
import { EventHandlers } from 'voximplant-websdk/EventHandlers';
import { toggleBannedStatus } from '@/store/settings';

// Statuses code list of the call https://voximplant.com/docs/references/voxengine/callevents#failed
const CALL_STATUSES: string[] = ['486', '408', '487', '603', '404', '480', '402', 'ENDED'];
const createCall = createEvent<{ number: string; video?: boolean }>();
const setCall = createEvent<{
  id: string;
  call: Call;
  params: { video?: boolean; muted?: boolean };
}>();
const transferCall = createEvent<string>();
const removeCall = createEvent<string>();
const hangUp = createEvent<{ id: string }>();
const setActiveCall = createEvent<string>();
const setSelectCall = createEvent<string>();
const setLastCallNumber = createEvent<{ number: string; isVideo: boolean }>();
const setCurrentCallAsPaused = createEffect();
const toggleCallActive = createEffect<{ id: string }, EventHandlers.Updated>();
const changeCanToggle = createEvent<{ status: boolean; id: string }>();
const toggleLocalVideo = createEvent<{ id: string; status: boolean }>();
const toggleRemoteAudio = createEvent<{ id: string }>();
const toggleRemotePausedState = createEvent<{ id: string; status: boolean }>();
const toggleRemoteVideo = createEvent<{ id: string; status: boolean }>();
const toggleRemoteSharingVideo = createEvent<{ id: string; status: boolean }>();
const changeAudioDevice = createEvent<string>();
const changeVideoDevice = createEvent<string>();
const setCallDuration = createEvent();
const answerIncomingCall = createEvent<{ id: string; isVideo: boolean }>();
const changeLastTransferredCallNumbers = createEvent<{ number1: string; number2: string }>();
const setFailedStatus = createEvent<string>();
const openCallState = createEvent<string>();

const $calls = createStore<
  Record<
    string,
    {
      call: Call;
      params: {
        video: boolean; // passed to the SDK when creating a call, including the transmission and reception of video
        muted: boolean; // the state of the microphone of the remote user
        remoteVideo?: boolean; // the state of the camera of the remote user
        canToggleActive: boolean; // blocks changing the state of the call if it was stopped on the other side
        remotePausedState: boolean;
      };
    }
  >
>({});
const $callDuration = createStore<DurationStore>({});

const $lastCallNumber = createStore<{ number: string; isVideo: boolean }>({
  number: '',
  isVideo: false,
});
const $lastTransferredCallNumbers = restore(changeLastTransferredCallNumbers, {
  number1: '',
  number2: '',
});
const $currentActiveCallId = restore(setActiveCall, ''); // active call in SDK
const $currentSelectCallId = restore(setSelectCall, ''); // select call in UI

const activeCalls = $calls.map<ActiveCall[]>((store) => {
  const activeCalls = Object.entries(store).reduce((acc, [key, item]) => {
    const active = item.call.active();
    const state = (item.call.state() as unknown) as string;
    const incoming = item.call.settings?.incoming;
    if (state === 'ALERTING' && incoming) {
      return acc;
    } else {
      return [
        ...acc,
        {
          id: key,
          number: incoming ? item.call.settings.displayName : item.call.number(),
          status: active && state === 'Connected' ? 'paused' : state,
          video: item.params.video,
          active: active,
          direction: incoming ? 'incoming' : 'outbound',
        },
      ];
    }
  }, [] as ActiveCall[]);
  return activeCalls.sort((call) => (call.active ? -1 : 1));
});

const incomingCalls = $calls.map((store) => {
  return Object.entries(store).reduce((acc, curr) => {
    const state = (curr[1].call.state() as unknown) as string;
    if (state === 'ALERTING' && curr[1].call.settings.incoming) {
      toggleBannedStatus(false);
      return [
        ...acc,
        {
          id: curr[0],
          number: curr[1].call.settings.displayName,
          video: curr[1].params.video,
        },
      ];
    } else {
      return acc;
    }
  }, [] as { id: string; number: string; video: boolean }[]);
});

const currentActiveCall = combine($calls, $currentActiveCallId, (calls, id) => {
  if (calls[id]?.call.active()) return calls[id];
});

const currentSelectCall = combine(activeCalls, $currentSelectCallId, (calls, id) => {
  return calls?.find((call) => call.id === id);
});

const toggleCallStatus = (): void => {
  const selectCallId = $currentSelectCallId.getState();
  const activeCallId = $currentActiveCallId.getState();
  if (selectCallId) {
    if (activeCallId && activeCallId !== selectCallId) {
      // stop current active call if the changes are not for the current active call
      setCurrentCallAsPaused({}).then(() => {
        toggleCallActive({ id: selectCallId });
      });
    } else {
      // if there are no active calls or the changes for the current
      toggleCallActive({ id: selectCallId });
    }
  }
};

export {
  CALL_STATUSES,
  createCall,
  setCall,
  transferCall,
  removeCall,
  hangUp,
  setActiveCall,
  setSelectCall,
  setLastCallNumber,
  setCurrentCallAsPaused,
  toggleCallActive,
  toggleLocalVideo,
  toggleRemoteAudio,
  toggleRemotePausedState,
  toggleRemoteVideo,
  toggleRemoteSharingVideo,
  changeAudioDevice,
  changeVideoDevice,
  setCallDuration,
  changeLastTransferredCallNumbers,
  incomingCalls,
  $calls,
  answerIncomingCall,
  $callDuration,
  $lastCallNumber,
  $lastTransferredCallNumbers,
  $currentActiveCallId,
  changeCanToggle,
  $currentSelectCallId,
  activeCalls,
  currentActiveCall,
  currentSelectCall,
  setFailedStatus,
  openCallState,
  toggleCallStatus,
};
