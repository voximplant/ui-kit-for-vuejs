<i18n>
{
  "en": {
    "outbound": "Outbound Call",
    "incoming": "Incoming Call",
    "subTitle": "Line #",
    "buttons": {
      "end": "End call",
      "transfer": "Transfer"
    },
    "hintForDisabled": "You have reached the limit of 50 active calls. To make a new call, please end one of the existing ones.",
    "statuses": {
      "pause": "Paused"
    }
  },
  "ru": {
    "outbound": "Исходящий звонок",
    "incoming": "Входящий звонок",
    "subTitle": "Линия №",
    "buttons": {
      "end": "Завершить",
      "transfer": "Перевести"
    },
    "hintForDisabled": "Превышен лимит в 50 активных звонков. Для совершения нового звонка, пожалуйста, завершите один из существующих звонков.",
    "statuses": {
      "pause": "Пауза"
    }
  }
}
</i18n>

<template lang="pug">
div(:class="callClasses")
  .wrap
    .title-wrap(v-if="!settingsState.minimize")
      Typography.title {{ t(`${selectCall?.direction}`) }}
      Typography.sub-title(v-if="calls.length > 48") {{ `${t('subTitle')}${calls.length}` }}
    .call-wrap
      .avatar-wrap(v-if="!settingsState.minimize")
        Icon(
          color="--sui-gray-400"
          name="ic24-user"
          width="42"
          height="46"
        )
        .icon-mic-off(v-if="isRemoteMute" )
          Icon.icon-mute(
            color="--sui-white"
            name="ic24-mic-off"
            width="20"
            height="20"
          )
      .number
        Hint(
          :text="selectCall?.status !== 'PROGRESSING' && selectCall?.status !== 'CONNECTED' && settingsState.minimize ? errorText : ''"
        )
          Typography.phone-number {{ selectCall.number }}
      .status
        Typography.call-time(v-if="!settingsState.minimize") {{ selectCall?.status === 'CONNECTED' && !selectCall.active ? `${t('statuses.pause')}&nbsp; · &nbsp;` : ''}}
        Typography.call-time(v-if="callDuration[selectCall?.id] && selectCall?.status === 'CONNECTED'") {{ selectCall.active ? timeFormat(callDuration[selectCall?.id].callDuration) : timeFormat(callDuration[selectCall?.id].pauseDuration) }}
        Loading.animation(v-if="selectCall?.status === 'PROGRESSING'")
    AudioCallFooter
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Button, Hint, Icon, Typography } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import Loading from '@/components/animation/Loading.vue';
  import CallInfo from '@/components/calls/CallInfo.vue';
  import SplitButton from '@/components/buttons/SplitButton.vue';
  import DropdownList from '@/components/common/DropdownList.vue';
  import AudioCallFooter from '@/components/calls/AudioCallFooter.vue';
  import { $settings } from '@/store/settings/index';
  import {
    $callDuration,
    $calls,
    $currentSelectCallId,
    CALL_STATUSES,
    currentSelectCall,
  } from '@/store/calls/index';
  import { useStore } from 'effector-vue/composition';
  import { timeFormat } from '@/lib/Helpers';

  export default defineComponent({
    name: 'Call',
    components: {
      CallInfo,
      DropdownList,
      SplitButton,
      Loading,
      Typography,
      Button,
      Icon,
      Hint,
      AudioCallFooter,
    },
    setup() {
      const { t } = useI18n();
      const settingsState = useStore($settings);
      const selectCall = useStore(currentSelectCall);
      const currentSelectCallId = useStore($currentSelectCallId);
      const callDuration = useStore($callDuration);
      const calls = useStore($calls);
      const isRemoteMute = computed(() => calls.value[currentSelectCallId.value]?.params.muted);
      const errorText = computed(() =>
        selectCall.value && CALL_STATUSES.includes(selectCall.value?.status)
          ? t(`errors.${selectCall.value?.status}`)
          : selectCall.value?.status
      );
      const callClasses = computed(() => ({
        call: !settingsState.value.minimize,
        'call-collapsed': settingsState.value.minimize,
      }));

      return {
        t,
        selectCall,
        calls,
        timeFormat,
        callDuration,
        settingsState,
        errorText,
        isRemoteMute,
        callClasses,
      };
    },
  });
</script>

<style scoped>
  .call {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    overflow: hidden;
    padding: 16px 16px 24px;
    width: 100%;
    & .wrap {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
      width: 100%;
      gap: 16px;
    }
    & .title-wrap {
      align-items: center;
      display: flex;
      flex-direction: column;
    }
    & .title {
      color: black;
      display: block;
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
    }
    & .sub-title {
      font-size: 16px;
      line-height: 20px;
      margin-bottom: 16px;
    }
    & .call-wrap {
      align-items: center;
      display: flex;
      flex-direction: column;
      width: 84%;
      overflow: hidden;
      & .number {
        width: 100%;
        justify-content: center;
        &::v-deep(.hint-container) {
          width: initial;
        }
      }
    }
    & .avatar-wrap {
      align-items: center;
      position: relative;
      background-color: var(--sui-gray-100);
      border-radius: 50%;
      display: flex;
      height: 64px;
      justify-content: center;
      margin-bottom: 24px;
      width: 64px;
    }
    & .icon-mic-off {
      background-color: var(--sui-red-500);
      width: 28px;
      height: 28px;
      border-radius: 14px;
      position: absolute;
      right: -5px;
      bottom: -5px;
      display: flex;
      & .icon-mute {
        margin: auto;
      }
    }
    & .avatar {
      border-radius: 50%;
      height: auto;
      width: 100%;
    }
    & .phone-number {
      color: var(--sui-gray-900);
      display: block;
      font-size: 16px;
      line-height: 20px;
      margin-bottom: 4px;
      white-space: nowrap;
      width: initial;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }
    & .call-time {
      color: var(--sui-purple-500);
      display: block;
    }
    & .status {
      display: flex;
      min-height: 30px;
    }
    & .animation {
      margin-top: 16px;
    }
  }

  .call-collapsed {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    overflow: hidden;
    width: 100%;
    margin: auto;
    padding: 16px;
    & .wrap {
      align-items: center;
      display: flex;
      flex-direction: row;
      height: 100%;
      justify-content: space-between;
      width: 100%;
      gap: 16px;
    }
    & .call-wrap {
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 84%;
    }
    & .status {
      margin: 0;
      min-height: 0;
    }
    & .animation {
      margin: 0;
    }
    & .button-end {
      margin-left: 16px;
    }
    & .phone-number {
      color: var(--sui-gray-900);
      display: block;
      font-size: 16px;
      line-height: 20px;
      margin-bottom: 4px;

      white-space: nowrap;
      width: initial;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & .number {
      display: flex;
      width: inherit;
      &::v-deep(.hint-container) {
        width: 100%;
      }
    }
  }
</style>
