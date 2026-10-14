import { useEffect, useRef, useState } from "react";
import { DURATION } from "../data/timeline";
export function usePlayback(duration = DURATION, renderMode = false) {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(renderMode),
    [started, setStarted] = useState(renderMode);
  const clock = useRef({ time: 0, stamp: 0 });
  useEffect(() => {
    if (!playing || renderMode) return;
    clock.current = { time, stamp: performance.now() };
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(
        duration,
        clock.current.time + (now - clock.current.stamp) / 1000,
      );
      setTime(t);
      if (t === duration) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // The clock captures time only when starting/resuming, not every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, duration, renderMode]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);
  function play() {
    setStarted(true);
    if (time >= duration) setTime(0);
    setPlaying(true);
  }
  function restart() {
    setTime(0);
    setStarted(true);
    if (playing) {
      clock.current = { time: 0, stamp: performance.now() };
    }
    setPlaying(true);
  }
  function seek(t: number) {
    setTime(Math.max(0, Math.min(duration, t)));
    clock.current = {
      time: Math.max(0, Math.min(duration, t)),
      stamp: performance.now(),
    };
  }
  return {
    time,
    playing,
    started,
    play,
    restart,
    seek,
    pause: () => setPlaying(false),
  };
}
