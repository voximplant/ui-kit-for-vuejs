import appConfig from '@/config';

type callComponentName = 'VideoCall' | 'Call';
let CALL_COMPONENT_NAME: callComponentName = 'VideoCall';

const useCallComponentName = (): void => {
  CALL_COMPONENT_NAME = appConfig.AUDIO_ONLY ? 'Call' : 'VideoCall';
};

export { CALL_COMPONENT_NAME, useCallComponentName };
