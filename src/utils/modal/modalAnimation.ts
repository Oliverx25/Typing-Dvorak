export const MODAL_TRANSITION_MS = 200;

export function getModalTransitionMs(): number {
  if (typeof window === 'undefined') return MODAL_TRANSITION_MS;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  return MODAL_TRANSITION_MS;
}

export function modalBackdropClass(closing: boolean): string {
  return closing ? 'modal-backdrop-exit' : 'modal-backdrop-enter';
}

export function modalPanelClass(closing: boolean): string {
  return closing ? 'modal-panel-exit' : 'modal-panel-enter';
}

export function modalDialogClass(closing: boolean): string {
  return closing ? 'modal-dialog-closing' : 'modal-dialog-open';
}
