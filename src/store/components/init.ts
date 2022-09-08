import { $currentComponent, changeInfoStatus } from '@/store/components/index';

$currentComponent.on(changeInfoStatus, (store, status) => {
  let componentName = store;
  switch (status) {
    case 'accessMicrophone':
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
