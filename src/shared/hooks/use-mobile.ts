import { useMaxWidth } from '@/shared/hooks/use-max-width';

/** Phone-first layouts (tables → cards). Matches Tailwind `md` (768px). */
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  return useMaxWidth(MOBILE_BREAKPOINT);
}
