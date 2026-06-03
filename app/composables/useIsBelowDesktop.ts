/**
 * Shared media-query check for "below the desktop breakpoint."
 *
 * 1023px matches Tailwind's `lg` breakpoint (`min-width: 1024px`),
 * which is the line where the studio chrome stops being usable and
 * MobileBlocker takes over. Keeping the threshold in one place stops
 * components from drifting apart on what "mobile" means.
 */
export function useIsBelowDesktop() {
  return useMediaQuery("(max-width: 1023px)");
}
