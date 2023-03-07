<i18n>
{
  "en": {
    "isNotSignIn": {
      "title": "To make and receive calls you need to log in",
      "description": "Use your application user’s credentials.",
      "button": "Continue"
    },
    "accessMicrophone": {
      "title": "Allow access to your microphone",
      "description": "To turn on the microphone, click on the microphone icon in the browser bar and reload the softphone.",
      "button": "Refresh"
    },
    "transferredCall": {
      "title": "The call has been transferred successfully",
      "description": "You successfully transferred the call from {callNumberFrom} to {callNumberTo}",
      "button": "Ok"
    }
  },
  "ru": {
    "isNotSignIn": {
      "title": "Для совершения и приема звонков вам необходимо авторизоваться",
      "description": "Используйте учетные данные пользователя вашего приложения.",
      "button": "Продолжить"
    },
    "accessMicrophone": {
      "title": "Предоставьте доступ к микрофону",
      "description": "Для включения микрофона нажмите на значок микрофона в панели браузера и обновите софтфон.",
      "button": "Обновить"
    },
    "transferredCall": {
      "title": "Звонок успешно переведён",
      "description": "Вы успешно перевели звонок с номера {callNumberFrom} на номер {callNumberTo}",
      "button": "Хорошо"
    }
  }
}
</i18n>

<template lang="pug">
.info-page
  .content-wrap
    Illustration.pic(
      v-if="infoStatus === 'isNotSignIn'"
      illustrationsUrl="static/icons-pack.svg"
      name="started"
      width="216"
      height="175"
    )
    Icon.icon-status(
      v-if="infoStatus !== 'isNotSignIn'"
      height="40"
      width="40"
      :name="infoStatus === 'transferredCall' ? 'ic24-success-fill' : 'ic24-info-fill'"
      :color="infoStatus === 'transferredCall' ? '--sui-green-500' : '--sui-blue-500'"
    )
    Typography(:class="getTitleClass").title {{ t(`${infoStatus}.title`) }}
    Typography(:class="getDescriptionClass").description {{ t(`${infoStatus}.description`, { callNumberFrom: `${lastTransferredCallNumbers.number1}`,callNumberTo: `${lastTransferredCallNumbers.number2}`,}) }}
    Button(@click="changeInfoStatus(infoStatus)") {{ t(`${infoStatus}.button`) }}
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Button, Icon, Illustration, Typography } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import { $infoComponentStatus, changeInfoStatus } from '@/store/components/index';
  import { useStore } from 'effector-vue/composition';
  import { $lastTransferredCallNumbers, activeCalls } from '@/store/calls/index';

  export default defineComponent({
    name: 'Info',
    components: { Typography, Illustration, Button, Icon },
    setup() {
      const { t } = useI18n();
      const infoStatus = useStore($infoComponentStatus);
      const lastTransferredCallNumbers = useStore($lastTransferredCallNumbers);
      const getTitleClass = computed(() => ({
        'title-welcome': infoStatus.value === 'isNotSignIn',
        'title-text': infoStatus.value !== 'isNotSignIn',
      }));
      const getDescriptionClass = computed(() => ({
        'description-welcome': infoStatus.value === 'isNotSignIn',
        'Description-text': infoStatus.value !== 'isNotSignIn',
      }));

      return {
        t,
        infoStatus,
        changeInfoStatus,
        activeCalls,
        lastTransferredCallNumbers,
        getTitleClass,
        getDescriptionClass,
      };
    },
  });
</script>

<style scoped>
  .info-page {
    display: flex;
    height: 100%;
    & .content-wrap {
      align-items: center;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: fit-content;
      justify-content: center;
      margin: auto;
      padding: 87.5px 24px;
    }
    & .pic {
      height: fit-content;
      margin-bottom: 30px;
    }
    & .icon-status {
      margin-bottom: 24px;
    }
    & .title {
      color: var(--sui-gray-900);
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      text-align: center;
    }
    & .title-welcome {
      font-size: 14px;
      line-height: 20px;
    }
    & .title-text {
      font-size: 20px;
      line-height: 24px;
    }
    & .description {
      color: var(--sui-gray-700);
      margin-bottom: 16px;
      text-align: center;
    }
    & .description-welcome {
      font-size: 12px;
      line-height: 16px;
    }
    & .description-text {
      font-size: 14px;
      line-height: 20px;
    }
  }
</style>
