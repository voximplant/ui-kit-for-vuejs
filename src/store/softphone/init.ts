import {
  $phoneInput,
  actionOnBtn,
  changeInputState,
  changeInputValue,
} from '@/store/softphone/index';
import { $dialingComponentStatus, changeComponentDialingStatus } from '@/store/components';
import {
  $lastCallNumber,
  createCall,
  currentActiveCall,
  hangUp,
  toggleCallActive,
} from '@/store/calls';
import { sendTone } from '@/lib/sdkSource';

$phoneInput.on(changeInputValue, (store, payload) => {
  const { value, event } = payload;
  const lastChar = event === 'change' ? value[value.length - 1] : value;
  if ($dialingComponentStatus.getState() === 'toneDial' && payload) {
    sendTone(lastChar);
  }
  const state = value ? 'default' : store.state;
  return event === 'change'
    ? { state, inputValue: value }
    : { state, inputValue: `${store.inputValue}${value}` };
});

$phoneInput.on(changeInputState, (store, payload) => {
  return {
    ...store,
    state: payload,
  };
});

$dialingComponentStatus.on(actionOnBtn, (store, type) => {
  const video = type === 'video';
  if (store === 'firstCall') {
    createCall({
      number:
        type === 'primary' || type === 'video'
          ? $phoneInput.getState().inputValue
          : $lastCallNumber.getState(),
      video: video,
    });
  }
  if (store === 'toneDial') {
    if (type === 'primary' || type === 'video') {
      const currentCall = currentActiveCall.getState();
      if (currentCall) {
        hangUp({ id: currentCall.id });
      }
    } else {
      changeComponentDialingStatus('newCall');
    }
  }
  if (store === 'newCall') {
    const currentId = currentActiveCall.getState()?.id;
    if (currentId) {
      toggleCallActive({ id: currentId });
    }
    createCall({ number: $phoneInput.getState().inputValue, video: video });
  }
});
