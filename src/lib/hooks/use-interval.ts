import React from "react";

/** Custom hook from Dan Abramov
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 **/

type Callback = () => any;
export const useInterval = (callback: Callback, delay: number) => {
  const savedCallback = React.useRef<Callback>();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    const tick = () => {
      savedCallback.current && savedCallback.current();
    };
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
