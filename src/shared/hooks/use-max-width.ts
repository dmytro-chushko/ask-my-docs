import * as React from 'react';

/**
 * `true` when the viewport width is strictly less than `maxWidth` px
 * (i.e. CSS `max-width: ${maxWidth - 1}px`).
 */
export function useMaxWidth(maxWidth: number) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const onChange = () => {
      setMatches(mql.matches);
    };

    onChange();
    mql.addEventListener('change', onChange);

    return () => mql.removeEventListener('change', onChange);
  }, [maxWidth]);

  return matches;
}
