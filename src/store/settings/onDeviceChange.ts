import { $settings, addActiveAudioDevice, getDevicesFx } from '@/store/settings/index';
import { changeAudioDevice } from '@/store/calls';

if (navigator.mediaDevices) {
  navigator.mediaDevices.ondevicechange = async () => {
    await getDevicesFx(null);
    const lastAudioDevicePosition = $settings.getState().audioDevices.length - 1;

    await addActiveAudioDevice({
      label: $settings.getState().audioDevices[lastAudioDevicePosition].name,
      value: $settings.getState().audioDevices[lastAudioDevicePosition].id,
    });
    if (!$settings.getState().mute) {
      const activeAudioDevice = $settings.getState().activeAudioDevice.value;
      if (typeof activeAudioDevice === 'string') changeAudioDevice(activeAudioDevice);
    }
  };
}
