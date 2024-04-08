<i18n>
{
  "en": {
    "buttons": {
      "end": "End call",
      "transfer": "Transfer"
    },
    "hintForDisabled": "You have reached the limit of 50 active calls. To make a new call, please end one of the existing ones."
  },
  "ru": {
    "buttons": {
      "end": "Завершить",
      "transfer": "Перевести"
    },
    "hintForDisabled": "Превышен лимит в 50 активных звонков. Для совершения нового звонка, пожалуйста, завершите один из существующих звонков."
  }
}
</i18n>

<template lang="pug">
.audio-call-footer
  .service-buttons(v-if="!settingsState.minimize")
    SplitButton.button
      template(#first-side)
        Button.button-left(
          size="l"
          iconOnly
          mode="outlined"
          :icon="{name: `${settingsState.mute ?  'ic24-mic-off' : 'ic24-mic'}`, color: getIconColor(isCallPaused || isCallProgressing)}"
          :disabled="isCallPaused || isCallProgressing"
          @click="changeMute(!settingsState.mute);"
        )
      template(#last-side)
        Button.button-right(
          size="l"
          mode="outlined"
          iconOnly
          ref="selectMics"
          :disabled="isCallPaused || isCallProgressing"
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
        :disabled="isCallProgressing"
        :icon="{ spriteUrl: 'static/icons-pack.svg', name: 'ic24-phone-new' }"
        size="l"
        iconOnly
        @click="makeNewCall"
      )
    Button.button(
      mode="outlined"
      size="l"
      :disabled="isCallPaused || isCallProgressing"
      :icon="{name: 'ic20-numbers', width: '20px', height: '20px'}"
      iconOnly
      @click="switchNumpad"
    )
    Button.button(
      mode="outlined"
      size="l"
      :disabled="!canCurrentCallToggleActive || isCallProgressing"
      :icon="selectCall?.active ? 'ic24-pause' : 'ic24-play'"
      @click="canCurrentCallToggleActive && toggleCallStatus()"
    )
  .call-buttons
    Button.call-button.button-end(
      mode="alert"
      :iconOnly="settingsState.minimize"
      :icon="{name: 'ic20-phone-missed', color: '--sui-white'}"
       @click="() => hangUp({ id: selectCall?.id })"
    ) {{ settingsState.minimize ? '' : t('buttons.end') }}
    Button.call-button(
      v-if="showAdditionalButton"
      mode="flat"
      ref="selectCalls"
      @click="onOpenTransferSelect()"
    ) {{ t('buttons.transfer') }}
      Icon.icon-transfer(
        name="ic12-arrow-down"
        color="--sui-purple-500"
        width="12"
        height="12"
        :class="{'transform': isOpenTransferSelect}"
      )
    transition(name="fade")
      TransferCallList(v-if="isOpenTransferSelect" )
</template>

<script lang="ts">
  import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
  import SplitButton from '@/components/buttons/SplitButton.vue';
  import Loading from '@/components/animation/Loading.vue';
  import { Button, generateCheckClickOutside, Hint, Icon, Typography } from '@voximplant/spaceui';
  import DropdownList from '@/components/common/DropdownList.vue';
  import { useStore } from 'effector-vue/composition';
  import { $settings, addActiveAudioDevice, changeMute } from '@/store/settings';
  import {
    $calls,
    changeAudioDevice,
    currentSelectCall,
    hangUp,
    toggleCallStatus,
  } from '@/store/calls';
  import { changeComponent, changeComponentDialingStatus } from '@/store/components';
  import { needToShowAdditionalButton } from '@/store/NeedToShowAdditionalButton';
  import { useI18n } from 'vue-i18n';
  import CallInfo from '@/components/calls/CallInfo.vue';
  import TransferCallList from '@/components/calls/TransferCallList.vue';

  export default defineComponent({
    name: 'AudioCallFooter',
    components: {
      SplitButton,
      Loading,
      Typography,
      Button,
      Icon,
      Hint,
      DropdownList,
      CallInfo,
      TransferCallList,
    },
    setup() {
      const { t } = useI18n();
      const isOpenMicList = ref(false);
      const isOpenTransferSelect = ref(false);
      const selectCalls = ref<HTMLDivElement | null>(null);
      const selectMics = ref<HTMLDivElement | null>(null);
      const settingsState = useStore($settings);
      const selectCall = useStore(currentSelectCall);
      const calls = useStore($calls);
      const showAdditionalButton = useStore(needToShowAdditionalButton);
      const isCallPaused = computed(() => !selectCall.value?.active);
      const isCallProgressing = computed(
        () => selectCall.value?.status === 'PROGRESSING' || selectCall.value?.status === 'ALERTING'
      );
      const canCurrentCallToggleActive = computed(() => {
        if (!selectCall.value) return false;
        return calls.value[selectCall.value?.id]?.params.canToggleActive;
      });
      const getIconColor = (disabled: boolean) => {
        if (disabled) return '--sui-gray-400';
        else return settingsState.value.mute ? '--sui-red-500' : '--sui-gray-700';
      };

      const checkClickOutsideCalls = generateCheckClickOutside(selectCalls);
      const checkClickOutsideMics = generateCheckClickOutside(selectMics);
      const onOpenTransferSelect = () => (isOpenTransferSelect.value = !isOpenTransferSelect.value);
      const onOpenListMics = () => (isOpenMicList.value = !isOpenMicList.value);

      const onClickOutside = (event: MouseEvent) => {
        if (checkClickOutsideCalls(event) && isOpenTransferSelect.value) onOpenTransferSelect();
        if (checkClickOutsideMics(event) && isOpenMicList.value) onOpenListMics();
      };
      const closeSelect = (event: KeyboardEvent) => {
        const isPushKey = event.key === 'Escape';
        if (isPushKey && isOpenTransferSelect.value) isOpenTransferSelect.value = false;
        if (isPushKey && isOpenMicList.value) isOpenMicList.value = false;
      };
      const isAudioActive = (id: number | string) => {
        return id === settingsState.value.activeAudioDevice.value;
      };
      const setActiveAudioDevice = (name: string, id: string) => {
        if (!settingsState.value.mute) {
          addActiveAudioDevice({ label: name, value: id });
          changeAudioDevice(id);
        } else {
          addActiveAudioDevice({ label: name, value: id });
        }
      };
      const makeNewCall = () => {
        changeComponent('Dialing');
        changeComponentDialingStatus('newCall');
      };
      const switchNumpad = () => {
        changeComponent('Dialing');
        changeComponentDialingStatus('toneDial');
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
        calls,
        settingsState,
        selectCall,
        selectCalls,
        selectMics,
        isOpenMicList,
        isOpenTransferSelect,
        onOpenTransferSelect,
        isCallPaused,
        isCallProgressing,
        canCurrentCallToggleActive,
        showAdditionalButton,
        changeMute,
        hangUp,
        isAudioActive,
        setActiveAudioDevice,
        makeNewCall,
        onOpenListMics,
        switchNumpad,
        toggleCallStatus,
        getIconColor,
      };
    },
  });
</script>

<style scoped>
  .audio-call-footer {
    display: flex;
    flex-direction: column;
    gap: 24px;

    & .service-buttons {
      display: flex;
      position: relative;

      & .button {
        &:not(:first-child) {
          margin-left: 24px;
          min-width: 48px;
        }

        .button-left {
          border-bottom-right-radius: 0;
          border-top-right-radius: 0;
          &:focus {
            z-index: 5;
          }
        }
        .button-right {
          border-bottom-left-radius: 0;
          border-left: 0;
          border-top-left-radius: 0;
        }
      }
      & .mic-list {
        bottom: calc(100% + 4px);
        max-height: 200px;
        right: 0;
        width: 100%;
      }
      & .select-list {
        list-style: none;
        margin: 0;
        padding: 0;

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
      }
    }

    & .call-buttons {
      display: flex;
      justify-content: center;
      position: relative;
      width: 100%;

      & .call-button {
        &:not(:first-child) {
          margin-left: 16px;
        }
        & .icon-transfer {
          margin-left: 10px;
          transition: transform 0.1s ease-out;
        }
        & .transform {
          transform: rotate(180deg);
          transition: transform 0.1s ease-out;
        }
      }
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
</style>
