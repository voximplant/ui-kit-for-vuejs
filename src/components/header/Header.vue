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
    "numpad": "Numpad",
    "endedCall": "Call ended",
    "pausedCall": "Call paused",
    "hints": {
      "buttonMinimize": "Minimize",
      "buttonMaximize": "Expand",
      "buttonFullscreen": "Maximize",
      "buttonCollapse": "Collapse",
      "buttonClose": "Close",
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
      "timeout": "Timeout",
      "dialing": "Dialing"
    },
    "moreActionsList": {
      "settings": "Settings",
      "logout": "Logout"
    }
  },
  "ru": {
    "header": "Вход",
    "videoCall": {
      "outbound": "Исходящий видеозвонок",
      "incoming": "Входящий видеозвонок"
    },
    "outbound": "Исходящий вызов",
    "incoming": "Входящий вызов",
    "newCall": "Новый звонок",
    "numpad": "Панель набора",
    "endedCall": "Вызов завершен",
    "pausedCall": "Вызов приостановлен",
    "hints": {
      "buttonMinimize": "Уменьшить",
      "buttonMaximize": "Увеличить",
      "buttonFullscreen": "Развернуть",
      "buttonCollapse": "Свернуть",
      "buttonClose": "Закрыть",
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
      "afterService": "Постобработка",
      "timeout": "Перерыв",
      "dialing": "Набор номера"
    },
    "moreActionsList": {
      "settings": "Настройки",
      "logout": "Выйти"
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
      Hint.tooltip(v-if="appConfig.IS_PLATFORM_INTEGRATED" :text="t('hints.buttonClose')")
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
            ref="moreActionsBtn"
            :icon="{name: 'ic20-more-ver', color: '--sui-gray-400'}"
            @click="toggleActionsDropdownList(!isOpenMoreActions)"
          )
        transition(name="fade")
          DropdownList.more-actions-dropdown(v-if="isOpenMoreActions")
            ul.select-list
              li.list-item(
                v-for="action in moreActionsList"
                @click="action.click"
              )
                Icon(
                  v-if="action.icon"
                  :color="action.icon.color"
                  :name="action.icon.name"
                  width="20"
                  height="20"
                )
                Typography {{ action.name }}
      .title-wrap
        Icon.icon-using-of-cam(
          v-if="showActiveCamIcon"
          color="--sui-red-500"
          spriteUrl="static/icons-pack.svg"
          name="ic16-using-of-cam"
          width="16"
          height="16"
        )
        Typography.user-name(v-if="minimizeTitle") {{ minimizeTitle }}
      .buttons-wrap
        Hint.tooltip(:text="settingsState.minimize ? t('hints.buttonMaximize') : t('hints.buttonMinimize')")
          Button.collapse(
            iconOnly
            size="m"
            :icon="getMinimizeIcon"
            @click="toggleMinimize"
          )
        Hint.tooltip(v-if="!appConfig.AUDIO_ONLY" :text="settingsState.maximize ? t('hints.buttonCollapse') : t('hints.buttonFullscreen')")
          Button.collapse(
            iconOnly
            size="m"
            :icon="getMaximizeIcon"
            @click="toggleMaximize"
          )
        Hint.tooltip(v-if="appConfig.IS_PLATFORM_INTEGRATED" :text="t('hints.buttonClose')")
          Button.button-close(
            iconOnly
            size="m"
            :icon="{name: 'ic20-close', color: '--sui-gray-400'}"
            @click="logoutFx"
          )
    .statuses-wrap(v-if="!settingsState.minimize && signInStore.queueType !== QueueType.None")
      Badge.badge(
        v-if="isBannedStatus"
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
          :options="signInStore.queueType === QueueType.SmartQueue ? statusesSq : statuses"
          :transparent="true"
          :placeholder="t('statuses.placeholder')"
        )
</template>

<script lang="ts">
import {computed, defineComponent, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {Badge, Button, generateCheckClickOutside, Hint, Icon, IconProp, Select, Typography} from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import { $signInFields, logoutFx } from '@/store/signIn/index';
  import { useStore } from 'effector-vue/composition';
  import {
    $currentComponent,
    $dialingComponentStatus,
    changeComponent,
  } from '@/store/components/index';
  import DropdownList from '@/components/common/DropdownList.vue';
  import {
    $isBannedStatus,
    $queueStatus,
    $settings,
    $softphoneParameters,
    changeQueueStatus,
    toggleMaximize,
    toggleMinimize,
  } from '@/store/settings/index';
  import { QueueType } from '@/types';
  import { OperatorACDStatuses } from 'voximplant-websdk';
  import {
    $callDuration,
    $calls,
    $currentSelectCallId,
    currentSelectCall,
    incomingCalls,
  } from '@/store/calls';
  import appConfig from '@/config';

  export default defineComponent({
    name: 'Header',
    components: { Typography, Button, Select, Badge, Hint, Icon, DropdownList },
    setup() {
      const { t } = useI18n();
      const i18n = useI18n({ useScope: 'global', inheritLocale: true });
      const settingsState = useStore($settings);
      const softphoneParameters = useStore($softphoneParameters);
      const signInStore = useStore($signInFields);
      const queueStatus = useStore($queueStatus);
      const currentComponent = useStore($currentComponent);
      const dialingComponentStatus = useStore($dialingComponentStatus);
      const selectCall = useStore(currentSelectCall);
      const selectCallId = useStore($currentSelectCallId);
      const isBannedStatus = useStore($isBannedStatus);
      const durations = useStore($callDuration);
      const incoming = useStore(incomingCalls);
      const isOpenMoreActions = ref(false);
      const tooltipVisibility = computed(() => (isOpenMoreActions.value ? 'hidden' : 'visible'));
      const toggleActionsDropdownList = (params: boolean) => {
        isOpenMoreActions.value = params;
      };
      const moreActionsBtn = ref<HTMLDivElement | null>(null);
      const checkClickOutsideBtn = generateCheckClickOutside(moreActionsBtn);
      const onClickOutside = (event: MouseEvent) => {
        if (checkClickOutsideBtn(event) && isOpenMoreActions.value) {
          toggleActionsDropdownList(!isOpenMoreActions.value);
        }
      };
      const closeSelect = (event: KeyboardEvent) => {
        const isPushKey = event.key === 'Escape';
        if (isPushKey && isOpenMoreActions.value) toggleActionsDropdownList(false);
      };
      onMounted(() => {
        document.addEventListener('click', onClickOutside, { capture: true });
        document.addEventListener('keydown', closeSelect);
      });
      onBeforeUnmount(() => {
        document.removeEventListener('click', onClickOutside);
        document.removeEventListener('keydown', closeSelect);
      });
      const moreActionsList = computed(() => [
        {
          name: t('moreActionsList.settings'),
          icon: {
            name: 'ic20-settings',
            color: '--sui-gray-700',
          },
          click: () => {
            changeComponent('Settings');
            toggleActionsDropdownList(false);
          },
        },
        {
          name: t('moreActionsList.logout'),
          click: () => {
            logoutFx({});
            toggleActionsDropdownList(false);
          },
        },
      ]);

      const calls = useStore($calls);
      const isVideoCall = computed(
        () =>
          calls.value[incoming.value[0]?.id]?.params.video ||
          calls.value[selectCallId.value]?.params.video
      );
      const isSelectCallNotEnded = computed(() => {
        return selectCall.value && selectCall.value.status !== 'ENDED';
      });

      const minimizeTitle = computed(() => {
        if (!settingsState.value.minimize) return '';

        if (currentComponent.value === 'CallEnded') return t('endedCall');
        // TITLE IF SELECTED CALL WAS ENDED
        else if (currentComponent.value === 'Dialing') {
          // TITLE IF THERE IS NO SELECTED INCOMING AND OUTBOUND CALLS
          switch (dialingComponentStatus.value) {
            case 'newCall': {
              return t('newCall');
            }
            case 'firstCall': {
              return t('newCall');
            }
            case 'toneDial': {
              return t('numpad');
            }
          }
        } else if (selectCall.value?.status === 'CONNECTED' && !selectCall.value.active)
          return t('pausedCall'); // TITLE IF SELECTED CALL'S WAS PAUSED

        if (selectCall.value?.direction === 'outbound' && isSelectCallNotEnded.value) {
          // TITLE FOR OUTBOUND AUDIO/VIDEO CALL
          return isVideoCall.value
            ? t(`videoCall.${selectCall.value?.direction}`)
            : t(`${selectCall.value?.direction}`);
        } else if (
          incoming.value.length ||
          (selectCall.value?.direction === 'incoming' && isSelectCallNotEnded.value)
        ) {
          // TITLE FOR INCOMING AUDIO/VIDEO CALL
          return isVideoCall.value ? t('videoCall.incoming') : t('incoming');
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
        const currentStatuses =
          signInStore.value.queueType === QueueType.SmartQueue ? statusesSq.value : statuses.value;
        return currentStatuses.find((item) => {
          return (
            item.value === OperatorACDStatuses[queueStatus.value] ||
            // SDK has no type SmartQueue statuses, SQ contains 'Dialing' status
            queueStatus.value === item.value.toUpperCase() // for set SQ status
          );
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

      const statuses = computed(() => [
        {
          label: t('statuses.online'),
          value: 'Online',
          icon: {
            spriteUrl: 'static/icons-pack.svg',
            name: 'ic8-status-dot-success',
          },
        },
        {
          label: t('statuses.ready'),
          value: 'Ready',
          icon: {
            spriteUrl: 'static/icons-pack.svg',
            name: 'ic8-status-dot-success',
          },
        },
        {
          label: t('statuses.offline'),
          value: 'Offline',
          icon: {
            spriteUrl: 'static/icons-pack.svg',
            name: 'ic8-status-dot-error',
          },
        },
        {
          label: t('statuses.dnd'),
          value: 'DND',
          icon: {
            spriteUrl: 'static/icons-pack.svg',
            name: 'ic8-status-dot-error',
          },
        },
        {
          label: t('statuses.inService'),
          value: 'InService',
          icon: {
            spriteUrl: 'static/icons-pack.svg',
            name: 'ic8-status-dot-processing',
          },
        },
        {
          label: t('statuses.afterService'),
          value: 'AfterService',
          icon: {
            spriteUrl: 'static/icons-pack.svg',
            name: 'ic8-status-dot-default',
          },
        },
        {
          label: t('statuses.timeout'),
          value: 'Timeout',
          icon: {
            spriteUrl: 'static/icons-pack.svg',
            name: 'ic8-status-dot-warning',
          },
        },
      ]);
      const statusesSq = computed(() => [
        ...statuses.value.filter((status) => status.value !== 'Timeout'),
        {
          label: t('statuses.dialing'),
          value: 'Dialing',
          icon: {
            spriteUrl: 'static/icons-pack.svg',
            name: 'ic8-status-dot-processing',
          },
        },
      ]);

      const getMinimizeIcon = computed<IconProp>(() => {
        return settingsState.value.minimize
          ? {
              spriteUrl: 'static/icons-pack.svg',
              name: 'ic20-minimize-screen-on',
              color: '--sui-gray-400',
            }
          : {
              spriteUrl: 'static/icons-pack.svg',
              name: 'ic20-minimize-screen-off',
              color: '--sui-gray-400',
            };
      });

      const getMaximizeIcon = computed<IconProp>(() => {
        return settingsState.value.maximize
          ? {
              spriteUrl: 'static/icons-pack.svg',
              name: 'ic20-maximize-screen-on',
              color: '--sui-gray-400',
            }
          : {
              spriteUrl: 'static/icons-pack.svg',
              name: 'ic20-maximize-screen-off',
              color: '--sui-gray-400',
            };
      });

      return {
        t,
        i18n,
        appConfig,
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
        statuses,
        statusesSq,
        getMinimizeIcon,
        getMaximizeIcon,
        settingsState,
        softphoneParameters,
        currentComponent,
        signInStore,
        QueueType,
        minimizeTitle,
        showActiveCamIcon,
        isOpenMoreActions,
        moreActionsBtn,
        moreActionsList,
        tooltipVisibility,
        toggleActionsDropdownList,
        isBannedStatus,
      };
    },
  });
</script>

<style scoped>
  .icon-using-of-cam {
    vertical-align: middle;
    margin-right: 4px;
  }
  .more-actions-dropdown {
    top: 40px;
    right: -15px; /* shift to the right for normal display with short username */
    width: fit-content;
  }
  .select-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .transform {
    transform: rotate(180deg);
    transition: transform 0.1s ease-out;
  }
  .list-item {
    display: flex;
    gap: 8px;
    cursor: pointer;
    padding: 8px 16px;

    &:last-child {
      border-top: 1px solid var(--sui-gray-300);
      padding-top: 8px;
    }
    &:hover,
    &:active,
    &.active {
      background-color: var(--sui-gray-100);
      color: var(--sui-purple-500);
    }
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
      gap: 8px;
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
      position: relative;

      &::v-deep(.sui-tooltip) {
        visibility: v-bind('tooltipVisibility') !important;
      }
    }

    & .user-name {
      color: var(--sui-white);
      font-size: 14px;
      line-height: 20px;
      max-width: 195px;
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
      z-index: 21; /* z-index 20-24 elements above dropdown, statuses, popups, draggable but below notifications  */
      margin-bottom: 0;
      min-height: 32px;
      width: 154px;

      &::v-deep(.sui-active-item-icon) {
        width: 8px !important; /* active icon size limit for safari */
      }
      &::v-deep(.sui-option-icon) {
        width: 8px !important; /* options icons size limit for safari */
      }
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
