<template lang="pug">
.web-phone-shell(:class="webPhoneClasses")
  NotificationBlock
  audio(
    id="ringtone"
    preload="auto"
    loop
    playsinline
  )
    source(src="@/assets/ringtone/ring.mp3" type="audio/mpeg")
  .header-block
    Header
  .content(:class="{'scrollbars': !settings.minimize}")
    ActiveCall(v-if="callsStore.length && !settings.maximize")
    IncomingCall(v-if="incoming.length")
    VideoCall(v-show="currentComponentStore === 'VideoCall'")
    component(v-if="currentComponentStore !== 'VideoCall'" :is="currentComponentStore")
</template>

<script lang="ts">
  import { computed, defineComponent, Ref } from 'vue';
  import { useStore } from 'effector-vue/composition';
  import Info from '@/components/Info.vue';
  import Header from '@/components/header/Header.vue';
  import SignUp from '@/components/SignUp.vue';
  import ActiveCall from '@/components/calls/ActiveCall.vue';
  import IncomingCall from '@/components/IncomingCall.vue';
  import Dialing from '@/components/Dialing.vue';
  import Call from '@/components/Call.vue';
  import Settings from '@/components/ Settings.vue';
  import { $currentComponent } from '@/store/components/index';
  import { $settings } from '@/store/settings/index';
  import { activeCalls, incomingCalls } from '@/store/calls/index';
  import VideoCall from '@/components/VideoCall.vue';
  import { useCallComponentName } from '@/hooks/callComponentName';
  import NotificationBlock from '@/components/NotificationBlock.vue';
  import { $showNotification } from '@/store/notification';
  import appConfig from '@/config';
  import CallEnded from '@/components/CallEnded.vue';
  interface ContentClasses {
    height: string;
    overflowY: string;
  }

  export default defineComponent({
    name: 'WebPhoneShell',
    components: {
      NotificationBlock,
      VideoCall,
      Settings,
      Call,
      Dialing,
      IncomingCall,
      ActiveCall,
      Header,
      Info,
      SignUp,
      CallEnded,
    },
    setup() {
      const settings = useStore($settings);
      const currentComponentStore = useStore($currentComponent);
      const incoming = useStore(incomingCalls);
      const callsStore = useStore(activeCalls);
      const showNotification = useStore($showNotification);
      const webPhoneClasses = computed(() => ({
        popup: callsStore.value.length > 0,
        maximize: settings.value.maximize,
        collapsed: settings.value.minimize,
        notification: showNotification.value,
      }));
      const contentClasses: Ref<ContentClasses> = computed(() =>
        appConfig.IS_CUSTOMIZE
          ? {
              height: 'fit-content',
              overflowY: 'auto',
            }
          : {
              height: '624px',
              overflowY: 'hidden',
            }
      );
      useCallComponentName();

      return {
        settings,
        currentComponentStore,
        callsStore,
        incoming,
        webPhoneClasses,
        contentClasses,
      };
    },
  });
</script>

<style scoped>
  .web-phone-shell {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(40, 41, 61, 0.04), 0 16px 24px rgba(96, 97, 112, 0.16);
    display: flex;
    flex-direction: column;
    height: v-bind('contentClasses.height');
    max-height: v-bind('contentClasses.height');
    overflow: hidden;
    transition: width 0.5s ease-out, height 0.5s ease-out;
    width: 384px;
    & .header-block {
      background-color: var(--sui-purple-500);
    }
    & .content {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: inherit;
      justify-content: flex-start;
      overflow-x: hidden;
      overflow-y: v-bind('contentClasses.overflowY');
      position: relative;
      width: 100%;
    }
  }
  .popup {
    height: v-bind('contentClasses.height');
    /* max-height: calc(100vh - 48px); */
  }
  .collapsed {
    height: 130px;
    transition: height 0.5s ease-out;
    & .content {
      height: 80px;
    }
  }
  .maximize {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(40, 41, 61, 0.04), 0 16px 24px rgba(96, 97, 112, 0.16);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.5s ease-out, height 0.5s ease-out;
    width: 100%;
    height: calc(100vh - 16px); /* 16px it is body padding of default */
    max-height: 100vh;
  }
  .notification {
    position: relative;
  }
  .web-phone-shell.notification::after {
    content: '';
    background: var(--sui-gray-900);
    height: 100%;
    position: absolute;
    width: 100%;
    opacity: 0.5;
    z-index: 20; /* z-index 20-24 elements above dropdown, popups, draggable but below notifications  */
  }
</style>
