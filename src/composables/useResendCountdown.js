import { computed, onBeforeUnmount, ref } from 'vue'

// "You can resend the OTP in mm:ss" cooldown, shared by the register and
// phone-verify flows. Call start() after every successful send.
export function useResendCountdown(seconds = 60) {
  const remaining = ref(0)
  let intervalId = null

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const start = () => {
    stop()
    remaining.value = seconds
    intervalId = window.setInterval(() => {
      remaining.value -= 1
      if (remaining.value <= 0) {
        stop()
      }
    }, 1000)
  }

  const label = computed(() => {
    const minutes = String(Math.floor(remaining.value / 60)).padStart(2, '0')
    const secs = String(remaining.value % 60).padStart(2, '0')
    return `${minutes}:${secs}`
  })

  onBeforeUnmount(stop)

  return { remaining, label, start, stop }
}
