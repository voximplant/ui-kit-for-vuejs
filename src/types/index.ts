import * as sdkTypes from 'voximplant-websdk';
import { ButtonMode, DropdownOptionProps, IconProp, InputState } from '@voximplant/spaceui';
import { AudioSourceInfo, VideoSourceInfo } from 'voximplant-websdk/Structures';

export type Component =
  | 'Settings'
  | 'SignUp'
  | 'Call'
  | 'Info'
  | 'IncomingCall'
  | 'ActiveCall'
  | 'Dialing'
  | 'VideoCall';

export type StatusInfo =
  | 'isNotSignIn'
  | 'accessMicrophone'
  | 'transferredCall'
  | 'transferredVideoCall';

export interface ButtonData {
  mode: ButtonMode;
  text: string;
  icon?: IconProp;
  click: () => void;
}

export interface NumpadData {
  title?: string;
  inputTitle?: string;
  activeCall?: boolean;
  hint?: string;
  buttonMain: ButtonData;
  buttonAdditional?: ButtonData;
}

export type NumpadType = 'firstCall' | 'toneDial' | 'newCall';

export enum QueueType {
  ACD = sdkTypes.QueueTypes.ACD,
  SmartQueue = sdkTypes.QueueTypes.SmartQueue,
  None = 0,
}

export enum CallState {
  ALERTING,
  PROGRESSING,
  CONNECTED,
  UPDATING,
  ENDED,
}

export interface Error {
  status: string;
  msg: string;
}

export interface Settings {
  minimize: boolean;
  maximize: boolean;
  activeAudioDevice: DropdownOptionProps;
  activeVideoDevice: DropdownOptionProps;
  ringtoneVolume: number;
  callVolume: number;
  audioDevices: AudioSourceInfo[];
  videoDevices: VideoSourceInfo[];
  audios: HTMLAudioElement[];
  ringtone: HTMLAudioElement;
  mute: boolean;
  videoMute?: boolean;
  sharing?: boolean;
  remoteSharing?: boolean;
  fullscreen: boolean;
}

export interface SignInFields {
  userName: string;
  password: string;
  applicationName: string;
  accountName: string;
  node: string;
  queueType: QueueType;
  remember: boolean;
}

export interface SignInErrors {
  userName: string;
  password: string;
  applicationName: string;
  accountName: string;
  notEnough: string;
}

export interface SoftphoneParameters {
  micAccessResult?: boolean;
  status?: string;
}

export interface ActiveCall {
  id: string;
  number: string;
  active: boolean;
  status: string;
  direction: string;
}

export interface Duration {
  duration: number;
  pauseDuration?: number;
}

export type DurationStore = Record<string, Duration>;

export interface PhoneInput {
  inputValue: string;
  state: InputState;
}
