<i18n>
{
  "en": {
    "incomingCall": "Incoming call...",
    "statuses": {
      "pause": "Paused"
    },
    "errors": {
      "486": "Destination number is busy",
      "408": "Destination number is busy",
      "487": "Request terminated",
      "603": "Call was rejected",
      "404": "Invalid number",
      "480": "Destination number is unavailable",
      "402": "Insufficient funds",
      "ENDED": "Request terminated"
    }
  },
  "ru": {
    "incomingCall": "Входящий звонок...",
    "statuses": {
      "pause": "Пауза"
    },
    "errors": {
      "486": "Набранный номер занят",
      "408": "Набранный номер занят",
      "487": "Вызов завершен",
      "603": "Вызов отклонен",
      "404": "Неверный номер",
      "480": "Номер недоступен",
      "402": "Недостаточно средств",
      "ENDED": "Вызов завершен"
    }
  }
}
</i18n>

<template lang="pug">
.call-info
  .avatar-wrap
    Icon(color="--sui-gray-400" name="ic24-user")
  .calls-wrap
    Typography.number.text(:fontColor="userColor ? '--sui-white' : '--sui-gray-900'") {{ callData?.number }}
    .status-wrap
      Typography.status.text(
        v-if="callData?.status === 'CONNECTED' && !callData.active && !incomingCall"
        fontColor="--sui-purple-500"
        ) {{ `${t('statuses.pause')}&nbsp; · &nbsp;` }}
      Typography.status.text.error(v-if="callData?.status !== 'CONNECTED' && callData?.status !== 'PROGRESSING' && !incomingCall") {{ t(`errors.${callData?.status}`) }}
      Typography.call-time.text(
        v-if="currentCallDuration && !incomingCall && callData?.status === 'CONNECTED'"
        fontColor="--sui-purple-500"
        ) {{ callData.active ? timeFormat(currentCallDuration.callDuration) : timeFormat(currentCallDuration.pauseDuration) }}
      Typography.call-time.text(
        v-if="incomingCall"
        fontColor="--sui-gray-500"
        ) {{ t('incomingCall') }}
</template>

<script lang="ts">
  import { computed, defineComponent, PropType } from 'vue';
  import { Button, Icon, Typography } from '@voximplant/spaceui';
  import { $callDuration } from '@/store/calls';
  import { useStore } from 'effector-vue/composition';
  import { ActiveCall } from '@/types';
  import { timeFormat } from '@/lib/Helpers';
  import { useI18n } from 'vue-i18n';
  import { $settings } from '@/store/settings';

  export default defineComponent({
    name: 'CallInfo',
    components: { Typography, Button, Icon },
    props: {
      callData: {
        type: Object as PropType<ActiveCall>,
        required: true,
      },
      incomingCall: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const duration = useStore($callDuration);
      const settings = useStore($settings);
      const { t } = useI18n();

      const currentCallDuration = computed(() => {
        if (!props.callData) return;
        const { id } = props.callData;
        return duration.value[id as string] || {};
      });
      const userColor = computed(() => props.incomingCall || settings.value.fullscreen);

      return { t, currentCallDuration, timeFormat, userColor };
    },
  });
</script>

<style scoped>
  .call-info {
    align-items: center;
    display: flex;
    margin-right: 8px;
    cursor: pointer;
    & .avatar-wrap {
      align-items: center;
      background-color: var(--sui-gray-100);
      border-radius: 50%;
      display: flex;
      height: 32px;
      justify-content: center;
      margin-right: 8px;
      width: 32px;
    }
    & .avatar {
      height: 32px;
      width: 32px;
    }
    & .calls-wrap {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      max-width: 150px;
    }
    & .number {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    & .error {
      color: var(--sui-red-500);
    }
    & .text {
      display: block;
      font-size: 14px;
      line-height: 20px;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & .status-wrap {
      display: flex;
      width: auto;
    }
  }
</style>
