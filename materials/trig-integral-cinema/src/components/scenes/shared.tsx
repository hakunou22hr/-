import { motion } from "framer-motion";
import { Formula } from "../Formula";
export type SceneProps = { local: number };
export function Reveal({
  tex,
  visible = true,
  gold = false,
  className = "",
}: {
  tex: string;
  visible?: boolean;
  gold?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 18,
        filter: visible ? "blur(0px)" : "blur(8px)",
      }}
      transition={{ duration: 0.65 }}
      className={className}
    >
      <Formula tex={tex} className={gold ? "gold" : ""} />
    </motion.div>
  );
}
export function Label({ children }: { children: React.ReactNode }) {
  return <div className="scene-label">{children}</div>;
}
