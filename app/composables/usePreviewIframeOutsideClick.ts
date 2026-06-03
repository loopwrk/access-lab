/**
 * Treat clicks inside the preview iframe as "outside clicks" for any
 * dropdown, popover, or tooltip mounted in the parent page.
 *
 * @param onPreviewClick  Called once per pointerdown inside the preview
 *                        iframe. Typically `() => { isOpen.value = false }`.
 */
export function usePreviewIframeOutsideClick(onPreviewClick: () => void) {
  usePreviewMessage({
    'preview:pointerdown': onPreviewClick
  })
}
