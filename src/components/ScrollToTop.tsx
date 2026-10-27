import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollToTop() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[9999]"
      style={{ scaleX, background: "linear-gradient(90deg, #7B2FBE, #9D4EDD)" }}
    />
  );
}
