<i18n>
{
  "en": {
    "isNotSignIn": {
      "title": "Welcome!",
      "description": "This is a softphone based on our Web SDK. To make and receive calls, log in with a username created in your application.",
      "button": "Proceed"
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
      "title": "Добро пожаловать!",
      "description": "Это софтфон, разработанный с помощью нашего Web SDK. Чтобы совершать и принимать звонки, авторизуйтесь под именем пользователя, созданным в Вашем приложении.",
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
      illustrationsUrl="/static/icons-pack.svg"
      name="started"
      width="203"
      height="175"
    )
    Icon.icon-success(
      v-if="infoStatus !== 'isNotSignIn'"
      height="40"
      width="40"
      :name="infoStatus === 'transferredCall' ? 'ic24-success-fill' : 'ic24-info-fill'"
      color="--sui-green-500"
    )
    Typography.title {{ t(`${infoStatus}.title`) }}
    Typography.description {{ t(`${infoStatus}.description`, { callNumberFrom: `${lastTransferredCallNumbers.number1}`,callNumberTo: `${lastTransferredCallNumbers.number2}`,}) }}
    Button(@click="changeInfoStatus(infoStatus)") {{ t(`${infoStatus}.button`) }}
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
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
      return { t, infoStatus, changeInfoStatus, activeCalls, lastTransferredCallNumbers };
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
      padding: 24px;
    }
    & .pic {
      height: fit-content;
      margin-bottom: 30px;
    }
    & .icon-success {
      margin-bottom: 24px;
    }
    & .title {
      color: var(--sui-gray-900);
      display: block;
      font-size: 20px;
      font-weight: 500;
      line-height: 24px;
      margin-bottom: 8px;
      text-align: center;
    }
    & .description {
      color: var(--sui-gray-700);
      font-size: 14px;
      line-height: 20px;
      margin-bottom: 16px;
      text-align: center;
    }
  }
</style>
