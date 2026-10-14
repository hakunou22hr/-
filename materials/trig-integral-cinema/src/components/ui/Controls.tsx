import { DURATION, timeline } from "../../data/timeline";
type Props = {
  time: number;
  playing: boolean;
  started: boolean;
  captions: boolean;
  sound: boolean;
  togglePlay: () => void;
  restart: () => void;
  toggleCaptions: () => void;
  toggleSound: () => void;
  seek: (t: number) => void;
};
export function Controls(p: Props) {
  const format = (t: number) =>
    `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  return (
    <div className="controls">
      <div className="control-left">
        {p.started && (
          <>
            <button
              aria-label={p.playing ? "一時停止" : "再生"}
              onClick={p.togglePlay}
            >
              {p.playing ? "Ⅱ" : "▶"}
            </button>
            <button aria-label="最初から再生" onClick={p.restart}>
              ↺
            </button>
            <span className="time">
              {format(p.time)} <em>/ 1:30</em>
            </span>
          </>
        )}
      </div>
      {p.started && (
        <div className="progress-wrap">
          <input
            type="range"
            min="0"
            max={DURATION}
            step=".1"
            value={p.time}
            onChange={(e) => p.seek(Number(e.target.value))}
            aria-label="再生位置"
          />
          <div className="scene-ticks">
            {timeline.slice(1).map((s) => (
              <i
                key={s.id}
                style={{ left: `${(s.start / DURATION) * 100}%` }}
              />
            ))}
          </div>
        </div>
      )}
      <div className="control-right">
        <button
          className={p.captions ? "active" : ""}
          aria-pressed={p.captions}
          onClick={p.toggleCaptions}
        >
          字幕 <span>{p.captions ? "ON" : "OFF"}</span>
        </button>
        <button
          className={p.sound ? "active" : ""}
          aria-pressed={p.sound}
          onClick={p.toggleSound}
        >
          BGM <span>{p.sound ? "ON" : "OFF"}</span>
        </button>
        <button
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else
              void document.documentElement
                .requestFullscreen?.()
                .catch(() => {});
          }}
          aria-label="全画面"
        >
          ⛶
        </button>
      </div>
    </div>
  );
}
