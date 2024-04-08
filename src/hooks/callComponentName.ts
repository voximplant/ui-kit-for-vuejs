import { currentSelectCall } from '@/store/calls';

type callComponentName = 'VideoCall' | 'Call';
let CALL_COMPONENT_NAME: callComponentName = 'VideoCall';

const useCallComponentName = (): void => {
  CALL_COMPONENT_NAME = !currentSelectCall.getState()?.video ? 'Call' : 'VideoCall';
};

export { CALL_COMPONENT_NAME, useCallComponentName };
