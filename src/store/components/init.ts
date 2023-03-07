import { $currentComponent, changeInfoStatus } from '@/store/components/index';

$currentComponent.on(changeInfoStatus, (store, status) => {
  let componentName = store;
  switch (status) {
    case 'accessMicrophone':
      // Refresh button clicked
      window.location.reload();
      break;
    case 'transferredVideoCall':
      componentName = 'VideoCall';
      break;
    case 'transferredCall':
      componentName = 'Call';
      break;
    default:
      componentName = 'SignUp';
      break;
  }
  return componentName;
});
