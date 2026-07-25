<script setup lang="ts">
import { X } from '@lucide/vue'
import { computed, nextTick, onUnmounted, shallowRef, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description: string
    size?: 'sm' | 'md'
  }>(),
  {
    size: 'md',
  },
)

const emit = defineEmits<{
  close: []
}>()

const dialog = shallowRef<HTMLDialogElement>()
const titleId = computed(() => `${props.title.replaceAll(' ', '-').toLowerCase()}-title`)
const descriptionId = computed(() => `${titleId.value}-description`)
const widthClass = computed(() => (props.size === 'sm' ? 'max-w-md' : 'max-w-xl'))

function requestClose(): void {
  emit('close')
}

function handleCancel(event: Event): void {
  event.preventDefault()
  requestClose()
}

function handleDialogClose(): void {
  if (props.open) requestClose()
}

function handleBackdropClick(event: MouseEvent): void {
  const element = dialog.value
  if (!element || event.target !== element) return

  const bounds = element.getBoundingClientRect()
  const inside =
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom

  if (!inside) requestClose()
}

watch(
  () => props.open,
  async (open) => {
    await nextTick()
    const element = dialog.value
    if (!element) return

    if (open && !element.open) {
      element.showModal()
    } else if (!open && element.open) {
      element.close()
    }
  },
  { immediate: true, flush: 'post' },
)

onUnmounted(() => {
  if (dialog.value?.open) dialog.value.close()
})
</script>

<template>
  <dialog
    ref="dialog"
    class="day32-dialog m-auto w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
    :class="widthClass"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    @cancel="handleCancel"
    @close="handleDialogClose"
    @click="handleBackdropClick"
  >
    <div class="flex max-h-[min(90vh,48rem)] flex-col">
      <header class="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div class="min-w-0">
          <h2 :id="titleId" class="text-lg font-semibold tracking-tight">{{ title }}</h2>
          <p
            v-if="description"
            :id="descriptionId"
            class="mt-1 text-sm leading-5 text-muted-foreground"
          >
            {{ description }}
          </p>
        </div>
        <button
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          type="button"
          aria-label="Close dialog"
          @click="requestClose"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </header>

      <div class="min-h-0 overflow-y-auto p-6">
        <slot />
      </div>
    </div>
  </dialog>
</template>
