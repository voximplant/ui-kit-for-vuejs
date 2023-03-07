<template lang="pug">
DropdownList.transfer-dropdown
  ul.select-list
    li.list-item(
      v-for="(item, key) in candidatesForTransfer"
      :key="key"
      @click="transferCall(item.id)"
    )
      CallInfo(:callData="item")
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import CallInfo from '@/components/calls/CallInfo.vue';
  import DropdownList from '@/components/common/DropdownList.vue';
  import { $currentActiveCallId, activeCalls, transferCall } from '@/store/calls';
  import { useStore } from 'effector-vue/composition';

  export default defineComponent({
    name: 'TransferCallList',
    components: {
      DropdownList,
      CallInfo,
    },
    setup() {
      const activeCallsState = useStore(activeCalls);
      const currentCall = useStore($currentActiveCallId);

      const candidatesForTransfer = computed(() =>
        activeCallsState.value.filter((call) => call.id !== currentCall.value)
      );

      return {
        transferCall,
        candidatesForTransfer,
      };
    },
  });
</script>

<style scoped>
  .transfer-dropdown {
    bottom: calc(100% + 4px);
    width: 100%;
  }
  .select-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .list-item {
    cursor: pointer;
    padding: 8px 16px;
    &:hover,
    &:active,
    &.active {
      background-color: var(--sui-gray-100);
      color: var(--sui-purple-500);
    }
  }
</style>
