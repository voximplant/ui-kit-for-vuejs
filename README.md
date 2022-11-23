# Voximplant voice & video app for Vue.js

Voximplant voice & video app for Vue.js is a ready-to-use solution to embed Voximplant audio and video experience into a Vue based application, with full customization capabilities. The kit is ready to run as a standalone application or to leverage as a component inside an existing one.

You can use the kit as a softphone, a call-center operator workspace, a dialer in a CRM system and much more!

## Contents

- [Voice & video app features](#voice--video-app-features)
- [Why should I choose this voice & video app](#why-should-i-choose-this-voice--video-app)
- [How to build](#how-to-build)
- [How to setup backend](#how-to-setup-backend)
- [Business logic description](#business-logic-description)

## Voice & video app features

The kit provides the following features:

- Audio & video calls
- Call Voximplant users, SIP addresses and phone numbers
- Choose audio and video devices and disable them
- Use call queues for contact center
- Multiple simultaneous lines
- Mute, hold and call transfer functionality 
- Numpad
- Set status for users in queue (both ACD v1 and SmartQueue)
- Minimized & maximized vues
- Full-screen view
- Screen sharing
- Several video layouts

## Why should I choose this voice & video app

Voximplant voice & video app for Vue.js is a great choice for your business, because: 

- The Vue.js framework makes it easy to build
- Effector.js enables you to leverage any other framework
- Fully customizable 
- Ready to use as a standalone application or leverage as a component inside an application
- All business logic implemented at application store
- Cross-domain iframe API enables reach configuration options and flexibility

Benefits of the voice & video app for Vue.js:

- Rapid deployment — Leverage the call UI components to deploy quickly and easily 
- Optimize development time — Save time going through documentation as all components have embedded SDK functions and a recommended server scenario
- Flexibility — Components can be used for many different scenarios — call center webphones, video calls, CRM diallers & more
- Customizable — Use and adapt any of the components you need

## How to build

1. Make sure that [Node.js](https://nodejs.org) is installed on your computer.
    > XXX uses [Vue 3](https://vuejs.org/guide/introduction.html) for UI and [Effector](https://effector.dev/docs/glossary/) for business logic, but they will install automatically as dependencies.
1. Download the repository.
1. Navigate to the project folder and execute `yarn install` to install the dependencies and set up the project.
1. To compile and run the project, execute `yarn serve`.
1. To compile and minimize for production, execute `yarn build`
1. To lint and fix files, execute `yarn lint`.

## How to setup backend

To use the client, you need to:
1. Create an [application](https://voximplant.com/docs/gettingstarted/basicconcepts/applications) in the Voximplant platform.
1. Create a [user](https://voximplant.com/docs/gettingstarted/basicconcepts/users) to log into the application (or use an existing one).
1. Create a [scenario](https://voximplant.com/docs/gettingstarted/basicconcepts/scenarios) to process the calls logic.

For example, you can use this simple scenario, to process inbound and outbound calls to and from Voximplant users:

```js
VoxEngine.forwardCallToUser(null,true);
```

After you create it, you can run your application and log into it with an existing Voximplant user.

## Business logic description

### Main stores

- `$signInFields` contains authorization data (username, password, etc.)
- `$signInErrors` contains authorization errors data
- `$calls` contains current calls data
- `$settings` contains application settings (volume, devices, mute status, etc.)
- `$queueStatus` contains current queue status

### SignInFields events:

- `fillForm` fills the store when a user enters credentials
- `checkErrors` validates all form fields. The validation result stores in `$signInErrors` via the `setError` event. If there's an error in at least one form field, the `notEnough` property in the `$signInErrors` store will set to `true` and the authorization will fail.
- `restoreFillForm` restores user credentials from the previous session, if they are saved in the localStorage. The credentials can be saved in localStorage only if a user checks the Remember me checkbox in the authorization form.

### SignInErrors events:

- `setError` refreshes the form validation result during the authorization

### Calls events:

- `createCall` creates a new call and transferrs the destination (phone number, Voximplant username, or SIP address) and call type (audio or video) to the SDK, then receives the call ID.
- `setCall` sets the call to the store by its ID.
- `hangUp` ends the current call.
- `answerIncomingCall` answers the current call.
- `removeCall` removes the call from the store.
- `transferCall` transferrs the call to another user.
- `toggleCallActive` toggles the call hold. If set to false, the call is on hold.
- `setAllCallAsPaused` holds all the current calls, except the call that is passed as an argument. If no argument is passed, holds all calls.
- `changeAudioDevice` changes the audio device.

### Settings events:

- `changeVolume` sets the call and ringtone volume.
- `getAudios` gets the current DOM elements with the call audio.
- `getRingtone` gets the ringtone DOM element.
- `setRingtoneParam` sets the ringtone volume from the `ringtoneVolume` property.
- `toggleCollapsed` toggles window minimization (changes the DOM element height).
- `addActiveDevice` changes the active microphone.
- `changeMute` toggles microphone mute.
- `changeVideoMute` toggles camera.

### QueueStatus events:

- `changeQueueStatus` sends the queue status to the SDK.
- `setQueueStatus` sets the received from the SDK queue status to the store.