import { combine } from 'effector';
import { $calls, $lastCallNumber } from '@/store/calls/index';
import { $settings } from '@/store/settings/index';
import { $currentComponent } from '@/store/components/index';

export const needToShowAdditionalButton = combine(
  $settings,
  $currentComponent,
  $calls,
  $lastCallNumber,
  (settings, component, calls, lastCallNumber) => {
    if (settings.minimize) return false;
    const callsValues = Object.values(calls);
    const connectedCalls = callsValues.filter((call) => call?.call.signalingConnected);

    switch (component) {
      case 'Call':
        return Boolean(connectedCalls.length > 1);
      case 'VideoCall':
        return Boolean(connectedCalls.length > 1);
      default:
      case 'Dialing':
        return Boolean(lastCallNumber);
    }
  }
);
