import { createEvent, restore } from 'effector';
import { $currentActiveCallId, $currentSelectCallId, hangUp } from '@/store/calls';
import { resetSettings } from '@/store/signIn';
type NotificationStatuses =
  | 'none'
  | 'reconnecting'
  | 'callPause'
  | 'loginFailed'
  | 'sessionExpired'
  | 'pauseCallEnded';

const toggleNotification = createEvent<boolean>();
const setNotificationState = createEvent<NotificationStatuses>();

interface NotificationStatusContent {
  mode: string;
  icon: string;
  iconColor: string;
  showSpinner?: boolean;
  buttonMode: string;
  buttonIcon?: string;
  showButton?: boolean;
  showMinimazeText?: boolean;
  number?: string;
  buttonAction?: () => void;
}

interface NotificationContentInterface {
  [notificationStatus: string]: NotificationStatusContent;
}

const NotificationContent: NotificationContentInterface = {
  reconnecting: {
    mode: 'error',
    icon: 'ic24-error-fill',
    iconColor: '--sui-red-500',
    buttonMode: 'alert',
    showSpinner: true,
    buttonIcon: 'ic20-phone-missed',
    buttonAction: () =>
      hangUp({ id: $currentActiveCallId.getState() || $currentSelectCallId.getState() }),
  },
  callPause: {
    mode: 'info',
    icon: 'ic24-info-fill',
    iconColor: '--sui-blue-500',
    buttonMode: 'primary',
    showButton: true,
    showMinimazeText: true,
    buttonAction: () => toggleNotification(false),
  },
  loginFailed: {
    mode: 'error',
    icon: 'ic24-error-fill',
    iconColor: '--sui-red-500',
    buttonMode: 'primary',
    showButton: true,
    buttonAction: () => toggleNotification(false),
  },
  sessionExpired: {
    mode: 'error',
    icon: 'ic24-error-fill',
    iconColor: '--sui-red-500',
    buttonMode: 'primary',
    showButton: true,
    buttonAction: () => {
      resetSettings();
      toggleNotification(false);
    },
  },
  pauseCallEnded: {
    mode: 'info',
    icon: 'ic24-info-fill',
    iconColor: '--sui-blue-500',
    buttonMode: 'primary',
    showButton: true,
    buttonAction: () => toggleNotification(false),
  },
};

const $showNotification = restore(toggleNotification, false);
const $notificationState = restore(setNotificationState, 'none');

toggleNotification.watch(() => setNotificationState);

export {
  $showNotification,
  $notificationState,
  toggleNotification,
  setNotificationState,
  NotificationContent,
};
