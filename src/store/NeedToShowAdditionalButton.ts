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
    switch (component) {
      case 'Call':
        return Boolean(Object.keys(calls).length > 1);
        break;
      default:
      case 'Dialing':
        return Boolean(lastCallNumber);
        break;
    }
  }
);
