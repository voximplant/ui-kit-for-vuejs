import {
  $phoneInput,
  actionOnBtn,
  changeInputState,
  changeInputValue,
} from '@/store/softphone/index';
import { $dialingComponentStatus, changeComponentDialingStatus } from '@/store/components';
import { $lastCallNumber, createCall, currentActiveCall, hangUp } from '@/store/calls';
import { sendTone } from '@/lib/sdkSource';
import { changeVideoMute } from '@/store/settings';

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
  changeVideoMute(!video);
  if (store === 'firstCall') {
    createCall({
      number:
        $phoneInput.getState().inputValue && (type === 'primary' || type === 'video')
          ? $phoneInput.getState().inputValue
          : $lastCallNumber.getState().number,
      video: video,
    });
  }
  if (store === 'toneDial') {
    if (type === 'primary' || type === 'video') {
      const currentCall = currentActiveCall.getState()?.call;
      if (currentCall) {
        hangUp({ id: currentCall.id() });
      }
    } else {
      changeComponentDialingStatus('newCall');
    }
  }
  if (store === 'newCall') {
    createCall({ number: $phoneInput.getState().inputValue, video: video });
  }
});
