import { ref } from 'vue'

// Shared open/close state for the slide-in navigation drawer rendered by the
// Navbar. The ref lives at module scope (a singleton) so any component can
// drive the same drawer — e.g. the Hero "Start mock test" CTA opens it so the
// user can pick a subject. Navbar owns the actual markup; everyone else just
// flips this flag.
const isMobileMenuOpen = ref(false)

export function useMobileMenu() {
  const open = () => {
    isMobileMenuOpen.value = true
  }
  const close = () => {
    isMobileMenuOpen.value = false
  }
  const toggle = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  return { isMobileMenuOpen, open, close, toggle }
}
