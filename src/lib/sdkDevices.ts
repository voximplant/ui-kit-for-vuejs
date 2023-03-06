import { AudioSourceInfo, VideoSourceInfo } from 'voximplant-websdk/Structures';
import * as VoxImplant from 'voximplant-websdk';
import { AudioParams } from 'voximplant-websdk/Hardware/src/AudioParams';
import { Call } from 'voximplant-websdk/Call/Call';

export const requestMicrophonePermission = async (): Promise<boolean> => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  mediaStream.getTracks().forEach((track) => track.stop());
  return !!mediaStream;
};

export const getAudioDevices = async (): Promise<AudioSourceInfo[]> => {
  return await VoxImplant.Hardware.AudioDeviceManager.get().getInputDevices();
};

export const getVideoDevices = async (): Promise<VideoSourceInfo[]> => {
  return await VoxImplant.Hardware.CameraManager.get().getInputDevices();
};

export const getActiveAudioDevice = async (): Promise<AudioParams> => {
  return VoxImplant.Hardware.AudioDeviceManager.get().getDefaultAudioSettings();
};

export const changeMicrophone = (inputId: string): void => {
  const audioParams = {
    inputId,
    ...(inputId && { inputId }),
  };
  VoxImplant.Hardware.AudioDeviceManager.get().setDefaultAudioSettings(audioParams);
};

export const changeCamera = (cameraId: string): void => {
  const cameraParams = {
    cameraId,
    ...(cameraId && { cameraId }),
  };
  VoxImplant.Hardware.CameraManager.get().setDefaultVideoSettings(cameraParams);
};

export const changeAudio = (activeCall: Call, deviceId: string): void => {
  if (activeCall) {
    VoxImplant.Hardware.AudioDeviceManager.get().setCallAudioSettings(activeCall, {
      inputId: deviceId,
    });
  }
  VoxImplant.Hardware.AudioDeviceManager.get().setDefaultAudioSettings({ inputId: deviceId });
};

export const changeVideo = (activeCall: Call, deviceId: string): void => {
  if (activeCall) {
    VoxImplant.Hardware.CameraManager.get().setCallVideoSettings(activeCall, {
      cameraId: deviceId,
    });
  }
  VoxImplant.Hardware.CameraManager.get().setDefaultVideoSettings({ cameraId: deviceId });
};
