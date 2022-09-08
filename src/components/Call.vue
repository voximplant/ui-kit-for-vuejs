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
      "pause": "Paused",
      "error": "Connection failed"
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
    "Outbound call": "Исходящий звонок",
    "Incoming call": "Входящий звонок",
    "subTitle": "Линия №",
    "buttons": {
      "end": "Завершить звонок",
      "transfer": "Перевести звонок"
    },
    "hintForDisabled": "Превышен лимит в 50 активных звонков. Для совершения нового звонка, пожалуйста, завершите один из существующих звонков.",
    "statuses": {
      "pause": "Пауза",
      "error": "Не удалось установить соединение"
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
.call(:class="{'call-collapsed': settingsState.minimize}")
  .wrap
    .title-wrap(v-if="!settingsState.minimize")
      Typography.title {{ t(`${activeCall.direction}`) }}
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
          :text="activeCall.status !== 'PROGRESSING' && activeCall.status !== 'CONNECTED' && settingsState.minimize ? t(`errors.${activeCall.status}`) : ''"
        )
          .number
            Icon.icon-error(
              v-if="activeCall.status !== 'PROGRESSING' && activeCall.status !== 'CONNECTED' && settingsState.minimize"
              color="--sui-red-500"
              name="ic24-error-fill"
              width="20"
              height="20"
            )
            Typography.phone-number(:class="{'error' : activeCall.status !== 'PROGRESSING' && activeCall.status !== 'CONNECTED' && settingsState.minimize }") {{ activeCall.number }}
      .status
        Typography.call-time(v-if="!settingsState.minimize") {{ activeCall.status === 'CONNECTED' && !activeCall.active ? `${t('statuses.pause')}&nbsp; · &nbsp;` : ''}}
        Typography.call-time(v-if="callDuration[activeCall.id] && activeCall.status === 'CONNECTED'") {{ activeCall.active ? timeFormat(callDuration[activeCall.id].callDuration) : timeFormat(callDuration[activeCall.id].pauseDuration) }}
        Loading.animation(v-if="!callDuration[activeCall.id]")
        .error-container(v-if="!settingsState.minimize && activeCall.status !== 'CONNECTED'")
          Icon.icon-error(
            v-if="activeCall.status !== 'PROGRESSING'"
            color="--sui-red-500"
            name="ic24-error-fill"
            width="20"
            height="20"
          )
          Typography.error {{ activeCall.status === 'PROGRESSING' ? '' : t(`errors.${activeCall.status}`) }}
      .service-buttons(v-if="!settingsState.minimize")
        SplitButton.button
          template(#first-side)
            Button.button-left(
              size="l"
              iconOnly
              mode="outlined"
              :icon="{name: `${settingsState.mute ?  'ic24-mic-off' : 'ic24-mic'}`, color: `${ settingsState.mute ? '--sui-gray-400' : '--sui-gray-700'}`}"
              :disabled="statusDisable"
              :size="size"
              @click="changeMute(!settingsState.mute);"
            )
          template(#last-side)
            Button.button-right(
              size="l"
              mode="outlined"
              iconOnly
              :size="size"
              ref="selectMics"
              :disabled="statusDisable"
              :icon="{ name: 'ic12-arrow-down', width: '12px', height: '12px'}"
              @click="onOpenListMics"
            )
        transition(name="fade")
          DropdownList.mic-list(v-if="isOpenMicList")
            ul.select-list
              li.list-item(
                v-for="({ name, id }) in settingsState.audioDevices"
                :key="id"
                :class="{'active': isAudioActive(id)}"
                @click="setActiveAudioDevice(name, id)"
              ) {{ name }}
        Hint.button(
          :text="calls.length > 48 ? t('hintForDisabled') : ''"
        )
          Button(
            mode="outlined"
            iconOnly
            :icon="{ spriteUrl: '/static/icons-pack.svg', name: 'ic24-phone-new' }"
            size="l"
            :disabled="statusDisable"
            @click="makeNewCall"
          )
        Button.button(
          mode="outlined"
          iconOnly
          size="l"
          :icon="{name: 'ic20-numbers', width: '20px', height: '20px'}"
          @click="switchNumpad"
        )
        Button.button(
          mode="outlined"
          iconOnly
          size="l"
          :icon="activeCall.active ? 'ic24-pause' : 'ic24-play'"
          @click="toggleCallActive({ id: activeCall.id })"
        )
    .call-buttons
      Button.call-button.button-end(
        mode="alert"
        :iconOnly="settingsState.minimize"
        :icon="{name: 'ic20-phone-missed', color: '--sui-white'}"
        @click="() => hangUp({ id: activeCall.id })"
      ) {{ settingsState.minimize ? '' : t('buttons.end') }}
      Button.call-button(
        v-if="showAdditionalButton"
        mode="flat"
        ref="selectCalls"
        @click="isOpenSelect = !isOpenSelect"
      ) {{ t('buttons.transfer') }}
        Icon.icon-transfer(
          v-if="calls > 48"
          name="ic12-arrow-down"
          color="--sui-purple-500"
          width="12"
          height="12"
          :class="{'transform': isOpenSelect}"
        )
      transition(name="fade")
        DropdownList.transfer-dropdown(v-if="isOpenSelect")
          ul.select-list
            li.list-item(
              v-for="(item, key) in calls"
              :key="key"
              @click="transferCall(item.id)"
            )
              CallInfo(:callData="item")
</template>

<script lang="ts">
  import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
  import { Button, generateCheckClickOutside, Hint, Icon, Typography } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import Loading from '@/components/animation/Loading.vue';
  import CallInfo from '@/components/calls/CallInfo.vue';
  import SplitButton from '@/components/buttons/SplitButton.vue';
  import DropdownList from '@/components/common/DropdownList.vue';
  import { $settings, changeMute, addActiveAudioDevice } from '@/store/settings/index';
  import {
    $callDuration,
    $calls,
    $currentActiveCallId,
    activeCalls,
    changeAudioDevice,
    currentActiveCall,
    hangUp,
    toggleCallActive,
    transferCall,
  } from '@/store/calls/index';
  import { useStore } from 'effector-vue/composition';
  import { changeComponent, changeComponentDialingStatus } from '@/store/components/index';
  import { needToShowAdditionalButton } from '@/store/NeedToShowAdditionalButton';
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
    },
    setup() {
      const { t } = useI18n();
      const statusDisable = ref(false);
      const isOpenMicList = ref(false);
      const isOpenSelect = ref(false);
      const selectCalls = ref<HTMLDivElement | null>(null);
      const selectMics = ref<HTMLDivElement | null>(null);
      const settingsState = useStore($settings);
      const calls = useStore(activeCalls);
      const activeCall = useStore(currentActiveCall);
      const showAdditionalButton = useStore(needToShowAdditionalButton);
      const callDuration = useStore($callDuration);
      const allCalls = useStore($calls);
      const currentActiveCallId = useStore($currentActiveCallId);
      const isRemoteMute = computed(() => allCalls.value[currentActiveCallId.value]?.params.muted);

      const onOpenListMics = () => {
        isOpenMicList.value = !isOpenMicList.value;
      };

      const isAudioActive = (id: number | string) => {
        return id === settingsState.value.activeAudioDevice.value;
      };
      const setActiveAudioDevice = (name: string, id: string) => {
        addActiveAudioDevice({ label: name, value: id });
        changeAudioDevice(id);
      };

      const makeNewCall = () => {
        changeComponent('Dialing');
        changeComponentDialingStatus('newCall');
      };

      const switchNumpad = () => {
        changeComponent('Dialing');
        changeComponentDialingStatus('toneDial');
      };

      const checkClickOutsideCalls = generateCheckClickOutside(selectCalls);
      const checkClickOutsideMics = generateCheckClickOutside(selectMics);
      const onClickOutside = (event: MouseEvent) => {
        if (checkClickOutsideCalls(event) && isOpenSelect.value)
          isOpenSelect.value = !isOpenSelect.value;
        if (checkClickOutsideMics(event) && isOpenMicList.value)
          isOpenMicList.value = !isOpenMicList.value;
      };

      const closeSelect = (event: KeyboardEvent) => {
        const isPushKey = event.key === 'Escape';
        if (isPushKey && isOpenSelect.value) isOpenSelect.value = false;
        if (isPushKey && isOpenMicList.value) isOpenMicList.value = false;
      };

      onMounted(() => {
        document.addEventListener('click', onClickOutside, { capture: true });
        document.addEventListener('keydown', closeSelect);
      });

      onBeforeUnmount(() => {
        document.removeEventListener('click', onClickOutside);
        document.removeEventListener('keydown', closeSelect);
      });

      return {
        t,
        activeCall,
        calls,
        onOpenListMics,
        needToShowAdditionalButton,
        transferCall,
        timeFormat,
        showAdditionalButton,
        hangUp,
        toggleCallActive,
        statusDisable,
        isOpenSelect,
        changeAudioDevice,
        callDuration,
        selectCalls,
        isOpenMicList,
        selectMics,
        settingsState,
        switchNumpad,
        makeNewCall,
        changeMute,
        isAudioActive,
        addActiveAudioDevice,
        setActiveAudioDevice,
        isRemoteMute,
      };
    },
  });
</script>

<style scoped>
  .call {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    width: 100%;
    & .wrap {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
      width: 100%;
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
      padding: 16px 16px 0;
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
    }
    & .call-time {
      color: var(--sui-purple-500);
      display: block;
    }
    & .status {
      display: flex;
      margin-bottom: 40px;
      min-height: 30px;
    }
    & .error-container {
      align-items: center;
      display: flex;
    }
    & .icon-error {
      margin-right: 6px;
    }
    .error {
      color: var(--sui-red-500);
    }
    & .service-buttons {
      display: flex;
      position: relative;
    }
    & .mic-list {
      bottom: calc(100% + 4px);
      max-height: 200px;
      right: 0;
      width: 100%;
    }
    & .button {
      min-width: 96px;
      &:not(:first-child) {
        margin-left: 24px;
        min-width: 48px;
      }

      & .button-left {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        &:focus {
          z-index: 5;
        }
      }
      & .button-right {
        border-bottom-left-radius: 0;
        border-left: 0;
        border-top-left-radius: 0;
      }
    }
    & .call-buttons {
      display: flex;
      justify-content: center;
      padding: 24px;
      position: relative;
      width: 100%;
    }
    & .call-button {
      &:not(:first-child) {
        margin-left: 16px;
      }
    }

    & .transfer-dropdown {
      bottom: 100%;
      width: calc(100% - 96px);
    }

    & .icon-transfer {
      margin-left: 10px;
      transition: transform 0.1s ease-out;
    }
    & .select-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    & .transform {
      transform: rotate(180deg);
      transition: transform 0.1s ease-out;
    }
    & .list-item {
      cursor: pointer;
      padding: 8px 16px;
      &:hover,
      &:active,
      &.active {
        background-color: var(--sui-gray-100);
        color: var(--sui-purple-500);
      }
    }
    & .animation {
      margin-top: 16px;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.1s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .call-collapsed {
    padding: 16px;
    & .wrap {
      flex-direction: row;
    }
    & .call-buttons {
      padding: 0;
      width: fit-content;
    }
    & .call-wrap {
      align-items: center;
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
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
    & .number {
      display: flex;
    }
  }
</style>
