<i18n>
{
  "en": {
    "title": "Settings",
    "audioInput": "Audio Input",
    "videoInput": "Camera",
    "ringtone": "Ringtone volume",
    "call": "Call volume",
    "button": "Close settings"
  },
  "ru": {
    "title": "Настройки",
    "audioInput": "Микрофон",
    "videoInput": "Камера",
    "ringtone": "Громкость рингтона",
    "call": "Громкость звонка",
    "button": "Закрыть настройки"
  }
}
</i18n>

<template lang="pug">
.settings
  .settings-wrap
    .wrap
      .title-wrap
        Button.get-back(
          iconOnly
          mode="flat"
          :icon="{name: 'ic20-chevron-left', color: '--sui-gray-900'}"
          @click="openCallState(activeCallId || selectCallId)"
        )
        Typography.title {{ t('title') }}
      Select.video-select(
        v-if="settings.videoDevices?.length"
        @update:modelValue="(device) => chooseVideoDevice(device)"
        :modelValue="settings.activeVideoDevice"
        :disabled="isCallPaused"
        size="s"
        :label="t('videoInput')"
        :options="settings.videoDevices.map((device) => ({label: device.name || 'default', value: device.id || device.group}))"
      )
      Select.audio-select(
        @update:modelValue="(device) => chooseAudioDevice(device)"
        :modelValue="settings.activeAudioDevice"
        :disabled="isCallPaused"
        size="s"
        :label="t('audioInput')"
        :options="settings.audioDevices.map((device) => ({label: device.name || 'default', value: device.id || device.group}))"
      )
      Typography.title-audio {{ t('ringtone') }}
      .volume
        Button(
          mode="flat"
          iconOnly
          :icon="{name: 'ic20-volume-off', color: '--sui-gray-700'}"
          @click="changeVolume({ ringtoneVolume: 0 })"
        )
        Range.volume-range(
          id="ringtone-volume"
          :volumeValue="settings.ringtoneVolume"
          @input="(volumeValue) => changeVolume({ ringtoneVolume: Number(volumeValue) })"
        )
        Button(
          mode="flat"
          iconOnly
          :icon="{name: 'ic20-volume-max', color: '--sui-gray-700'}"
          @click="changeVolume({ ringtoneVolume: 1 })"
        )
      Typography.title-audio {{ t('call') }}
      .volume
        Button(
          mode="flat"
          iconOnly
          :icon="{name: 'ic20-volume-off', color: '--sui-gray-700'}"
          @click="changeVolume({ callVolume: 0 })"
        )
        Range.volume-range(
          id="call-volume"
          :volumeValue="settings.callVolume"
          @input="(volumeValue) => changeVolume({ callVolume: volumeValue })"
        )
        Button(
          mode="flat"
          iconOnly
          :icon="{name: 'ic20-volume-max', color: '--sui-gray-700'}"
          @click="changeVolume({ callVolume: 1 })"
        )
    Button.button-apply(@click="openCallState(activeCallId || selectCallId)") {{ t('button') }}
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Button, Icon, Select, Typography } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import Range from '@/components/range/Range.vue';
  import Call from '@/components/Call.vue';
  import { useStore } from 'effector-vue/composition';
  import {
    $settings,
    addActiveAudioDevice,
    addActiveVideoDevice,
    changeVolume,
    setRingtoneParam,
  } from '@/store/settings/index';
  import { changeComponent } from '@/store/components/index';
  import {
    $calls,
    $currentActiveCallId,
    $currentSelectCallId,
    changeAudioDevice,
    changeVideoDevice,
    currentSelectCall,
    openCallState,
  } from '@/store/calls';
  import appConfig from '@/config';

  interface ActiveDevice {
    label: string;
    value: string;
  }

  export default defineComponent({
    name: 'Settings',
    components: { Call, Range, Typography, Button, Icon, Select },
    setup() {
      const { t } = useI18n();
      const settings = useStore($settings);
      const activeCallId = useStore($currentActiveCallId);
      const selectCallId = useStore($currentSelectCallId);
      const allCalls = useStore($calls);
      const selectCall = useStore(currentSelectCall);
      const isCallPaused = computed(() => {
        if (!selectCall.value || selectCall.value.status === 'ENDED') return false;
        return (
          !selectCall.value?.active || allCalls.value[selectCallId.value]?.params.remotePausedState
        );
      });

      const chooseAudioDevice = (device: ActiveDevice) => {
        addActiveAudioDevice({ label: device.label, value: device.value });
        if (!settings.value.mute) changeAudioDevice(device.value);
      };
      const chooseVideoDevice = (device: ActiveDevice) => {
        addActiveVideoDevice({ label: device.label, value: device.value });
        if (!settings.value.videoMute) changeVideoDevice(device.value);
      };

      return {
        t,
        appConfig,
        settings,
        changeVolume,
        addActiveAudioDevice,
        changeComponent,
        setRingtoneParam,
        chooseAudioDevice,
        chooseVideoDevice,
        activeCallId,
        selectCallId,
        isCallPaused,
        openCallState,
      };
    },
  });
</script>

<style scoped>
  .settings {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    width: 100%;
    max-width: 557px;
    .settings-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
      padding: 0 24px 24px;
    }
    & .title-wrap {
      align-items: center;
      display: flex;
      padding: 16px 0 8px;
    }
    & .title {
      color: black;
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
    }
    & .get-back {
      margin-right: 90px;
    }
    & .title-audio {
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
      margin-bottom: 10px;
    }
    & .volume {
      align-items: center;
      display: flex;
      width: 100%;
      &:not(:last-child) {
        margin-bottom: 24px;
      }
    }
    & .volume-range {
      margin: 0 8px;
      width: 100%;
    }
    & .button-apply {
      margin: 0 auto;
    }
  }
</style>
