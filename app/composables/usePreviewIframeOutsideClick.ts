/**
 * Treat clicks inside the preview iframe as "outside clicks" for any
 * dropdown, popover, or tooltip mounted in the parent page.
 *
 * @param onPreviewClick  Called once per pointerdown inside the preview
 *                        iframe. Typically `() => { isOpen.value = false }`.
 */
const PREVIEW_POINTERDOWN_MESSAGE_TYPE = "preview:pointerdown";

export function usePreviewIframeOutsideClick(onPreviewClick: () => void) {
  function handleMessage(event: MessageEvent) {
    if (event.data?.type === PREVIEW_POINTERDOWN_MESSAGE_TYPE) {
      onPreviewClick();
    }
  }

  onMounted(() => {
    window.addEventListener("message", handleMessage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("message", handleMessage);
  });
}
