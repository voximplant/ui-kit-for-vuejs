import { combine, createEvent, createStore, restore } from 'effector';
import { Call } from 'voximplant-websdk/Call/Call';
import { ActiveCall, DurationStore } from '@/types';

const createCall = createEvent<{ number: string; video?: boolean }>();
const setCall = createEvent<{
  id: string;
  call: Call;
  params: { video?: boolean; muted?: boolean };
}>();
const transferCall = createEvent<string>();
const removeCall = createEvent<string>();
const hangUp = createEvent<{ id: string; incoming?: boolean }>();
const setActiveCall = createEvent<string>();
const setLastCallNumber = createEvent<string>();
const setAllCallAsPaused = createEvent<string | undefined>();
const toggleCallActive = createEvent<{ id: string; value?: boolean }>();
const toggleLocalVideo = createEvent<{ id: string; status: boolean }>();
const toggleRemoteAudio = createEvent<{ id: string }>();
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
  Record<string, { call: Call; params: { video: boolean; muted: boolean; remoteVideo?: boolean } }>
>({});
const $callDuration = createStore<DurationStore>({});

const $lastCallNumber = restore(setLastCallNumber, '');
const $lastTransferredCallNumbers = restore(changeLastTransferredCallNumbers, {
  number1: '',
  number2: '',
});
const $currentActiveCallId = restore(setActiveCall, '');

const activeCalls = $calls.map<ActiveCall[]>((store) => {
  const activeCalls = Object.entries(store).reduce((acc, [key, item]) => {
    const active = item.call.active();
    const state = item.call.state();
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
    if (curr[1].call.state() === 'ALERTING' && curr[1].call.settings.incoming) {
      return [
        ...acc,
        {
          id: curr[0],
          number: curr[1].call.settings.displayName,
        },
      ];
    } else {
      return acc;
    }
  }, [] as { id: string; number: string }[]);
});

const currentActiveCall = combine(activeCalls, $currentActiveCallId, (calls, id) => {
  return calls?.find((call) => call.id === id);
});

export {
  createCall,
  setCall,
  transferCall,
  removeCall,
  hangUp,
  setActiveCall,
  setLastCallNumber,
  setAllCallAsPaused,
  toggleCallActive,
  toggleLocalVideo,
  toggleRemoteAudio,
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
  activeCalls,
  currentActiveCall,
  setFailedStatus,
  openCallState,
};
