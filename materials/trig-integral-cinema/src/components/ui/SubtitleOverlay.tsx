import { motion, AnimatePresence } from "framer-motion";
export function SubtitleOverlay({
  text,
  enabled,
}: {
  text: string;
  enabled: boolean;
}) {
  return (
    <div className="subtitle-overlay">
      <AnimatePresence mode="wait">
        {enabled && text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
