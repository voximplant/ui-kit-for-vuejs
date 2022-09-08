<i18n>
{
  "en": {
    "header": "Sign In",
    "videoCall": {
      "outbound": "Outgoing Video Call",
      "incoming": "Incoming Video Call"
    },
    "outbound": "Outbound Call",
    "incoming": "Incoming Call",
    "newCall": "New Call",
    "hints": {
      "buttonMinimize": "Minimize",
      "buttonMaximize": "Maximize",
      "buttonExpand": "Expand",
      "buttonClose": "Close Softphone",
      "buttonsSettings": "More actions"
    },
    "statuses": {
      "placeholder": "Choose status",
      "banned": "Banned",
      "online": "Online",
      "ready": "Ready",
      "offline": "Offline",
      "dnd": "Do not disturb",
      "inService": "In service",
      "afterService": "After service",
      "timeout": "Timeout"
    }
  },
  "ru": {
    "header": "Вход",
    "hints": {
      "buttonCollapse": "Свернуть",
      "buttonExpand": "Развернуть",
      "buttonClose": "Закрыть Софтфон",
      "buttonsSettings": "Ещё"
    },
    "statuses": {
      "placeholder": "Выбрать статус",
      "banned": "Забанен",
      "online": "Онлайн",
      "ready": "Готов",
      "offline": "Оффлайн",
      "dnd": "Не беспокоить",
      "inService": "В разговоре",
      "afterService": "Постобратобка",
      "timeout": "Перерыв"
    }
  }
}
</i18n>

<template lang="pug">
.header
  .header-not-sign-in(v-if="softphoneParameters.status !== 'connected' || currentComponent === 'SignUp'")
    Typography.title {{ t('header') }}
    .lang-wrap
      Select.lang-select(
        v-model:modelValue="activeLang"
        size="s"
        :options="languages"
        :transparent="true"
      )
      Hint.tooltip(:text="t('hints.buttonClose')")
        Button.button-close(
          iconOnly
          size="m"
          :icon="{name: 'ic20-close', color: '--sui-gray-400'}"
          @click="logoutFx"
        )
  .header-sign-in(v-else)
    .settings-wrap
      .user-names(v-if="!settingsState.minimize")
        .user-name-wrap
          Typography.user-name {{ userName }}
          Typography.user-id {{ userID }}
        Hint.tooltip(:text="t('hints.buttonsSettings')")
          Button.user-settings(
            iconOnly
            size="m"
            :icon="{name: 'ic20-more-ver', color: '--sui-gray-400'}"
            @click="changeComponent('Settings')"
          )
      .title-wrap
        Icon.icon-using-of-cam(
          v-if="showActiveCamIcon"
          color="--sui-red-500"
          spriteUrl="/static/icons-pack.svg"
          name="ic16-using-of-cam"
          width="16"
          height="16"
        )
        Typography.user-name(v-if="minimizeTitle") {{ minimizeTitle }}
      .buttons-wrap
        Hint.tooltip(:text="settingsState.minimize ? t('hints.buttonExpand') : t('hints.buttonMinimize')")
          Button.collapse(
            iconOnly
            size="m"
            :icon="getMinimizeIcon"
            @click="toggleMinimize"
          )
        Hint.tooltip(:text="settingsState.maximize ? t('hints.buttonExpand') : t('hints.buttonMaximize')")
          Button.collapse(
            iconOnly
            size="m"
            :icon="getMaximizeIcon"
            @click="toggleMaximize"
          )
        Hint.tooltip(:text="t('hints.buttonClose')")
          Button.button-close(
            iconOnly
            size="m"
            :icon="{name: 'ic20-close', color: '--sui-gray-400'}"
            @click="logoutFx"
          )
    .statuses-wrap(v-if="!settingsState.minimize")
      Badge.badge(
        v-if="false"
        size="m"
        backgroundColor="--sui-red-500"
        color="white"
        :label="t('statuses.banned')"
      )
      .select-wrap
        Select.select-statuses(
          v-if="signInStore.queueType !== QueueType.None"
          @update:modelValue="(status) => changeQueueStatus(status.value)"
          :modelValue="currentStatus"
          size="s"
          :options="statuses"
          :transparent="true"
          :placeholder="t('statuses.placeholder')"
        )
</template>

<script lang="ts">
  import { computed, defineComponent, ref, watch } from 'vue';
  import { Badge, Button, Hint, Icon, IconProp, Select, Typography } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import { $signInFields, logoutFx } from '@/store/signIn/index';
  import { useStore } from 'effector-vue/composition';
  import { $currentComponent, changeComponent } from '@/store/components/index';
  import {
    $queueStatus,
    $settings,
    $softphoneParameters,
    $titleStatus,
    changeQueueStatus,
    toggleMaximize,
    toggleMinimize,
  } from '@/store/settings/index';
  import { QueueType } from '@/types';
  import { OperatorACDStatuses } from 'voximplant-websdk';
  import { $callDuration, $calls, $currentActiveCallId, currentActiveCall } from '@/store/calls';

  export default defineComponent({
    name: 'Header',
    components: { Typography, Button, Select, Badge, Hint, Icon },
    setup() {
      const { t } = useI18n();
      const i18n = useI18n({ useScope: 'global', inheritLocale: true });
      const settingsState = useStore($settings);
      const softphoneParameters = useStore($softphoneParameters);
      const signInStore = useStore($signInFields);
      const queueStatus = useStore($queueStatus);
      const currentComponent = useStore($currentComponent);
      const activeCall = useStore(currentActiveCall);
      const activeCallId = useStore($currentActiveCallId);
      const titleStatus = useStore($titleStatus);
      const durations = useStore($callDuration);

      const calls = useStore($calls);
      const isVideoCall = computed(() => calls.value[activeCallId.value]?.params.video);
      const minimizeTitle = computed(() => {
        if (
          isVideoCall.value &&
          (activeCall.value?.status === 'PROGRESSING' ||
            activeCall.value?.status === 'CONNECTED') &&
          settingsState.value.minimize
        ) {
          return t(`videoCall.${activeCall.value.direction}`);
        } else if (
          (activeCall.value?.status === 'PROGRESSING' ||
            activeCall.value?.status === 'CONNECTED') &&
          settingsState.value.minimize
        ) {
          return t(`${activeCall.value.direction}`);
        } else if (settingsState.value.minimize) {
          return t('newCall');
        }
      });
      const showActiveCamIcon = computed(
        () => minimizeTitle.value && isVideoCall.value && !settingsState.value.videoMute
      );

      const userName = computed<string>(() => signInStore.value.userName);
      const userID = computed<string>(
        () => `${signInStore.value.accountName}@${signInStore.value.applicationName}`
      );

      const currentStatus = computed(() => {
        return statuses.value.find((item) => {
          return item.value === OperatorACDStatuses[queueStatus.value];
        });
      });

      const languages = [
        {
          label: 'English',
          value: 'en',
          icon: 'ic24-flag-usa',
        },
        {
          label: 'Русский',
          value: 'ru',
          icon: 'ic24-flag-rus',
        },
      ];

      const activeLang = ref(languages[0]);

      watch(activeLang, () => {
        i18n.locale.value = activeLang.value.value;
      });

      const statuses = computed(() => {
        return [
          {
            label: t('statuses.online'),
            value: 'Online',
            icon: {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic8-status-dot-success',
            },
          },
          {
            label: t('statuses.ready'),
            value: 'Ready',
            icon: {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic8-status-dot-success',
            },
          },
          {
            label: t('statuses.offline'),
            value: 'Offline',
            icon: {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic8-status-dot-error',
            },
          },
          {
            label: t('statuses.dnd'),
            value: 'DND',
            icon: {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic8-status-dot-error',
            },
          },
          {
            label: t('statuses.inService'),
            value: 'InService',
            icon: {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic8-status-dot-processing',
            },
          },
          {
            label: t('statuses.afterService'),
            value: 'AFTER_SERVICE',
            icon: {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic8-status-dot-default',
            },
          },
          {
            label: t('statuses.timeout'),
            value: 'Timeout',
            icon: {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic8-status-dot-warning',
            },
          },
        ];
      });

      const getMinimizeIcon = computed<IconProp>(() => {
        return settingsState.value.minimize
          ? {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic20-minimize-screen-on',
              color: '--sui-gray-400',
            }
          : {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic20-minimize-screen-off',
              color: '--sui-gray-400',
            };
      });

      const getMaximizeIcon = computed<IconProp>(() => {
        return settingsState.value.maximize
          ? {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic20-maximize-screen-on',
              color: '--sui-gray-400',
            }
          : {
              spriteUrl: '/static/icons-pack.svg',
              name: 'ic20-maximize-screen-off',
              color: '--sui-gray-400',
            };
      });

      return {
        t,
        i18n,
        activeLang,
        currentStatus,
        languages,
        queueStatus,
        changeQueueStatus,
        durations,
        logoutFx,
        changeComponent,
        userName,
        userID,
        toggleMaximize,
        toggleMinimize,
        titleStatus,
        statuses,
        getMinimizeIcon,
        getMaximizeIcon,
        settingsState,
        softphoneParameters,
        currentComponent,
        signInStore,
        QueueType,
        minimizeTitle,
        showActiveCamIcon,
      };
    },
  });
</script>

<style scoped>
  .icon-using-of-cam {
    vertical-align: middle;
    margin-right: 4px;
  }
  .header {
    box-sizing: border-box;
    height: 100%;
    width: 100%;

    & .title {
      color: var(--sui-white);
      display: block;
      font-size: 24px;
      font-weight: 500;
      line-height: 28px;
    }

    & .header-not-sign-in {
      align-items: center;
      display: flex;
      justify-content: space-between;
      padding: 32px 24px;
    }

    & .icon-wrap {
      align-items: center;
      display: flex;
    }

    & .lang-select {
      height: 32px;
      margin: 0;
      min-height: 32px;
      min-width: 126px;
      outline: none;
    }

    & .button-close {
      background-color: transparent;
      border: none;
      height: 32px;
      width: 32px;
    }

    & .lang-wrap {
      align-items: center;
      display: flex;
    }

    & .header-sign-in {
      display: flex;
      flex-direction: column;
      padding: 16px;
      transition: padding 0.5s ease-out;
    }

    & .settings-wrap {
      align-items: center;
      display: flex;
      justify-content: space-between;
    }

    & .user-names {
      align-items: center;
      display: flex;
    }

    & .user-name {
      color: var(--sui-white);
      font-size: 14px;
      line-height: 20px;
      max-width: 230px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & .user-id {
      color: var(--sui-gray-400);
      font-size: 10px;
      line-height: 16px;
      max-width: 230px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & .user-name-wrap {
      display: flex;
      flex-direction: column;
      margin-right: 8px;
      overflow: hidden;
    }

    & .buttons-wrap {
      display: flex;
    }

    & .collapse,
    & .user-settings {
      color: var(--sui-gray-400);
      height: 32px;
      margin-right: 8px;
      width: 32px;
    }

    & .statuses-wrap {
      align-items: center;
      align-self: center;
      display: flex;
      margin-top: 8px;
      width: fit-content;
    }

    & .select-statuses {
      margin-bottom: 0;
      min-height: 32px;
      width: 154px;
    }
    & .select-wrap {
      height: 32px;
    }
    & .badge {
      margin-right: 4px;
    }

    & .tooltip {
      width: 32px;

      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }

  .collapsed {
    & .header-sign-in {
      padding: 8px 16px;
      transition: padding 0.5s ease-out;
    }
  }
</style>
