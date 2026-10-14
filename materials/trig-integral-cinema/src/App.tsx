import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Space } from "./components/Space";
import * as Scenes from "./components/scenes";
import { TitleScreen } from "./components/ui/TitleScreen";
import { Controls } from "./components/ui/Controls";
import { SubtitleOverlay } from "./components/ui/SubtitleOverlay";
import { captions } from "./data/captions";
import { sceneAt } from "./data/timeline";
import { theme } from "./data/theme";
import { usePlayback } from "./hooks/usePlayback";
import { CinemaAudio } from "./utils/audio";
const sceneComponents = [
  Scenes.SceneIntro,
  Scenes.SceneTunnel,
  Scenes.SceneQuestion,
  Scenes.SceneHalfAngle,
  Scenes.SceneGraphSync,
  Scenes.SceneIntegral1,
  Scenes.SceneProduct,
  Scenes.SceneProductToSum,
  Scenes.SceneIntegral2,
  Scenes.SceneEnding,
];
export default function App() {
  const player = usePlayback();
  const [subtitles, setSubtitles] = useState(true),
    [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState("");
  const audio = useRef<CinemaAudio | null>(null);
  const cueKey = useRef("");
  const scene = sceneAt(player.time);
  const local = player.time - scene.start;
  const Scene = sceneComponents[scene.id - 1];
  const variables = useMemo(
    () =>
      ({
        "--gold": theme.gold,
        "--cyan": theme.cyan,
        "--ink": theme.background,
      }) as React.CSSProperties,
    [],
  );
  useEffect(() => {
    audio.current = new CinemaAudio();
    return () => audio.current?.dispose();
  }, []);
  useEffect(() => {
    audio.current?.setActive(sound && player.playing);
  }, [sound, player.playing]);
  useEffect(() => {
    const phase =
      scene.id === 4 || scene.id === 8
        ? local < 2
          ? "split"
          : local < 4.5
            ? "merge"
            : "gold"
        : scene.id === 10
          ? "gold"
          : "";
    const key = `${scene.id}-${phase}`;
    if (key !== cueKey.current) {
      cueKey.current = key;
      if (sound && player.playing && phase)
        audio.current?.cue(phase as "split" | "merge" | "gold");
    }
  }, [scene.id, local, sound, player.playing]);
  async function toggleSound() {
    if (!sound) {
      try {
        await audio.current?.enable();
        setSound(true);
        setAudioError("");
      } catch {
        setAudioError("音声を利用できません。映像はそのまま再生できます。");
      }
    } else setSound(false);
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLButtonElement
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        player.playing ? player.pause() : player.play();
      }
      if (e.code === "KeyR") player.restart();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [player]);
  return (
    <main
      style={variables}
      className={`${player.started ? "is-started" : "is-title"} ${player.playing ? "is-playing" : "is-paused"} scene-${scene.id}`}
    >
      <Space
        time={player.started ? player.time : 5}
        scene={player.started ? scene.id : 1}
      />
      <header className="brand">
        <span className="brand-symbol">∫</span>
        <span>
          数学の、その先へ<small>VISUAL MATHEMATICS</small>
        </span>
      </header>
      <div className="edition">
        MATH III <span>／</span> 90″
      </div>
      <AnimatePresence mode="wait">
        {!player.started ? (
          <TitleScreen
            key="title"
            play={player.play}
            restart={player.restart}
          />
        ) : (
          <motion.section
            className="film-frame"
            key="film"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="scene-meta">
              <span>{String(scene.id).padStart(2, "0")} / 10</span> {scene.name}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                className="scene-stage"
                key={scene.id}
                initial={{ opacity: 0, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: scene.id >= 9 ? 0.2 : 0.55 }}
              >
                <Scene local={local} />
              </motion.div>
            </AnimatePresence>
            <SubtitleOverlay
              text={captions[scene.id - 1]}
              enabled={subtitles}
            />
            {player.time >= 90 && (
              <div className="replay">
                <button className="primary" onClick={player.restart}>
                  ↺ もう一度再生
                </button>
                <span>公式で変形し、積分できる形へ。</span>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
      {audioError && (
        <div role="status" className="audio-error">
          {audioError}
        </div>
      )}
      <Controls
        time={player.time}
        playing={player.playing}
        started={player.started}
        captions={subtitles}
        sound={sound}
        togglePlay={() => (player.playing ? player.pause() : player.play())}
        restart={player.restart}
        toggleCaptions={() => setSubtitles((v) => !v)}
        toggleSound={() => void toggleSound()}
        seek={player.seek}
      />
    </main>
  );
}
