<template lang="pug">
.web-phone-shell(:class="{'popup': callsStore.length > 0, 'maximize': settings.maximize, 'collapsed': settings.minimize}")
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
  import { defineComponent } from 'vue';
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

  export default defineComponent({
    name: 'WebPhoneShell',
    components: {
      VideoCall,
      Settings,
      Call,
      Dialing,
      IncomingCall,
      ActiveCall,
      Header,
      Info,
      SignUp,
    },
    setup() {
      const settings = useStore($settings);
      const currentComponentStore = useStore($currentComponent);
      const incoming = useStore(incomingCalls);
      const callsStore = useStore(activeCalls);

      return {
        settings,
        currentComponentStore,
        callsStore,
        incoming,
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
    height: 624px;
    overflow: hidden;
    transition: height 0.5s ease-out;
    width: 384px;
    & .header-block {
      background-color: var(--sui-purple-500);
    }
    & .content {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: flex-start;
      overflow-x: hidden;
      overflow-y: auto;
      position: relative;
      width: 100%;
    }
  }
  .popup {
    height: 624px;
    max-height: calc(100vh - 48px);
  }
  .collapsed {
    height: 120px;
    transition: height 0.5s ease-out;
    & .content {
      height: 72px;
    }
  }
  .maximize {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(40, 41, 61, 0.04), 0 16px 24px rgba(96, 97, 112, 0.16);
    display: flex;
    flex-direction: column;
    height: auto;
    overflow: hidden;
    transition: height 0.5s ease-out;
    width: 100%;
  }
</style>
