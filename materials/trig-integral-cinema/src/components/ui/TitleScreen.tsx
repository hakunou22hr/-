import { motion } from "framer-motion";
import { Formula } from "../Formula";
import { formulas as f } from "../../data/formulas";
export function TitleScreen({
  play,
  restart,
  duration = 90,
}: {
  play: () => void;
  restart: () => void;
  duration?: number;
}) {
  return (
    <motion.section
      className="title-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="title-eyebrow">
        <span /> MATHEMATICS III · CINEMATIC LESSON
      </div>
      <div className="title-formula">
        <Formula tex={f.problem1} />
      </div>
      <div className="title-copy">
        <p>数式が、空間になる。</p>
        <h1>
          三角関数の
          <br />
          不定積分<span className="gold-dot">.</span>
        </h1>
        <div className="subtitle">
          映画型{duration}秒版 <span>／</span> 変形が、答えをひらく。
        </div>
      </div>
      <div className="title-actions">
        <button className="primary" onClick={play}>
          <span className="play-icon">▶</span> 再生{" "}
          <span className="duration">{duration} SEC</span>
        </button>
        <a className="text-button video-link" href="./video.html">30秒MP4・ダウンロード ↗</a>
        <button className="text-button" onClick={restart}>
          最初から再生 ↗
        </button>
      </div>
      <div className="lesson-topics">
        <span>
          01 <b>半角公式</b>
        </span>
        <i />
        <span>
          02 <b>積和公式</b>
        </span>
      </div>
      <div className="title-orbit" />
      <div className="title-footer">
        高校数学Ⅲ <span>TRIGONOMETRIC INTEGRALS</span>
      </div>
    </motion.section>
  );
}
