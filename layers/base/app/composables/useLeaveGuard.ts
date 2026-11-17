import type { MaybeRefOrGetter } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

type LeaveAction = RouteLocationRaw | (() => unknown);

/**
 * Protects unsaved changes. While `isDirty` is true, leaving the route (sidebar,
 * links, browser back) or closing/reloading the tab asks for confirmation.
 * `confirmLeave` asks before a local exit such as closing a modal form, and
 * `leaveTo` navigates on purpose (after saving) without asking.
 *
 * Pair it with `AdminUnsavedChangesModal`, destructuring the result so the
 * template unwraps the ref:
 * `const { confirmOpen, leave } = useLeaveGuard(isDirty)` and
 * `<AdminUnsavedChangesModal v-model:open="confirmOpen" @leave="leave" />`.
 */
export function useLeaveGuard(isDirty: MaybeRefOrGetter<boolean>) {
  const confirmOpen = ref(false);
  let pending: LeaveAction | null = null;
  let bypass = false;

  async function leaveTo(to: RouteLocationRaw) {
    bypass = true;
    try {
      return await navigateTo(to);
    } finally {
      bypass = false;
    }
  }

  function run(action: LeaveAction) {
    return typeof action === 'function' ? action() : leaveTo(action);
  }

  function confirmLeave(action: LeaveAction) {
    if (!toValue(isDirty)) return run(action);
    pending = action;
    confirmOpen.value = true;
  }

  function leave() {
    confirmOpen.value = false;
    const action = pending;
    pending = null;
    return action ? run(action) : undefined;
  }

  function stay() {
    confirmOpen.value = false;
    pending = null;
  }

  onBeforeRouteLeave((to) => {
    if (bypass || !toValue(isDirty)) return true;
    pending = to.fullPath;
    confirmOpen.value = true;
    return false;
  });

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (!toValue(isDirty)) return;
    event.preventDefault();
    // Older browsers only show the native prompt when returnValue is set.
    event.returnValue = '';
  }

  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload));
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload));

  return { confirmOpen, confirmLeave, leave, stay, leaveTo };
}
