<template lang="pug">
VueDraggableNext.draggable-block(
  v-model="list"
  :disabled="!enabled"
  tag="transition-group"
  @start="startDrag"
  @end="endDrag"
)
  div(
    v-for="(element) in list" :key="element.id"
    :class="element.type === 'slot' ? slotClasses : videoBlockClasses"
    @mousedown="element.type === 'video' && setActiveBorder(true)"
    @mouseup="element.type === 'video' && setActiveBorder(false)"
  )
</template>

<script lang="ts">
  import { computed, defineComponent, ref, watch } from 'vue';
  import { changeVideoMute } from '@/store/settings';
  import { VueDraggableNext } from 'vue-draggable-next';
  import { hangUp } from '@/store/calls';

  export default defineComponent({
    name: 'DraggableBlock',
    components: {
      VueDraggableNext,
    },
    props: {
      isRemoteVideoMute: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const enabled = ref(true);
      const dragging = ref(false);
      const activeBorder = ref(false);
      const videoIndex = ref(1);
      const list = ref([
        { type: 'slot', id: 0 },
        { type: 'video', id: 1 },
        { type: 'slot', id: 2 },
      ]);
      const isButtonHolding = ref(false);
      const slotClasses = computed(() => ({
        slot: !dragging.value && !isButtonHolding.value,
        'slot-active': dragging.value || isButtonHolding.value,
      }));
      const startDrag = () => (dragging.value = true);
      const endDrag = (ev) => {
        videoIndex.value = ev.newIndex;
        activeBorder.value = false;
        isButtonHolding.value = false;
        dragging.value = false;
      };
      hangUp.watch(() => (activeBorder.value = false));

      changeVideoMute.watch((state) => (enabled.value = !state));
      watch(props, (state) => (enabled.value = !state.isRemoteVideoMute));
      watch(dragging, (state: boolean) => {
        if (state) document.body.style.cursor = 'grabbing';
        else document.body.style.cursor = 'default';
      });
      const videoBlockClasses = computed(() => ({
        'draggable-video': enabled.value,
        'video-in-window': enabled.value,
        'video-border': activeBorder.value,
        'dragging-style': dragging.value && enabled.value,
        'left-margin': videoIndex.value !== 1,
        'right-margin': videoIndex.value === 1,
        'top-margin': videoIndex.value !== 2,
        'bottom-margin': videoIndex.value === 2,
      }));
      const setActiveBorder = (status: boolean) => {
        isButtonHolding.value = status;
        if (enabled.value) activeBorder.value = status;
      };
      return {
        list,
        enabled,
        dragging,
        startDrag,
        endDrag,
        videoBlockClasses,
        slotClasses,
        setActiveBorder,
      };
    },
  });
</script>

<style scoped>
  .draggable-block {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: 50% 50%;
    grid-template-rows: 50% 50%;
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 11; /* z-index 11-15: draggable local video & video in small window */
  }
  .draggable-video {
    position: relative;
  }
  .slot {
    visibility: hidden;
  }
  .slot-active {
    width: auto;
    height: auto;
    margin: 33px;
    background: #36cfc9;
    opacity: 0.5;
    border-radius: 8px;
  }
  .video-in-window {
    cursor: grab;
    border-radius: 8px;
    position: relative;
    object-fit: cover;
    top: 0;
    left: 0;
    width: auto;
    height: auto;
    z-index: 11; /* z-index 11-15: draggable local video & video in small window */
  }
  .video-border {
    border: 4px solid #36cfc9;
    border-radius: 12px;
  }
  .dragging-style {
    visibility: hidden;
    position: relative;
    padding: 28px;
    margin: 0 !important;
  }

  .left-margin {
    margin-left: 16px;
  }
  .right-margin {
    margin-right: 16px;
  }
  .top-margin {
    margin-top: 16px;
  }
  .bottom-margin {
    margin-bottom: 16px;
  }
</style>
