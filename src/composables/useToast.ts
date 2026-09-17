import { ref } from 'vue'

export interface ToastItem {
  id: number
  message: string
}

const toasts = ref<ToastItem[]>([])
let seq = 0

export function useToast() {
  function showToast(message: string) {
    const id = ++seq
    toasts.value.push({ id, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 2000)
  }
  return { toasts, showToast }
}
