import { motion } from 'framer-motion';
import { SITE } from '@/constants/site';

export function WhatsAppButton() {
  return (
    <motion.a
      href={`${SITE.whatsappHref}?text=${encodeURIComponent('Hi! I would like to know more about Target Classes.')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/60" />
      <svg viewBox="0 0 32 32" className="size-7" fill="currentColor" aria-hidden="true">
        <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.352.615 4.65 1.782 6.671L2.667 29.333l6.83-1.79a13.27 13.27 0 0 0 6.507 1.71h.006c7.362 0 13.333-5.97 13.333-13.333 0-3.56-1.387-6.907-3.906-9.427a13.24 13.24 0 0 0-9.433-3.83Zm0 24.4h-.005a11.08 11.08 0 0 1-5.65-1.548l-.406-.24-4.053 1.063 1.082-3.951-.264-.406a11.05 11.05 0 0 1-1.696-5.912c0-6.11 4.976-11.086 11.096-11.086 2.963 0 5.75 1.156 7.843 3.253a11.02 11.02 0 0 1 3.247 7.84c0 6.112-4.976 11.087-11.094 11.087Zm6.083-8.302c-.334-.167-1.97-.972-2.276-1.083-.305-.111-.527-.166-.75.167-.221.333-.86 1.083-1.054 1.305-.194.223-.388.25-.72.084-.334-.167-1.409-.52-2.685-1.657-.992-.885-1.663-1.978-1.858-2.311-.194-.334-.021-.514.146-.68.15-.15.334-.39.5-.585.167-.195.222-.334.334-.556.111-.223.055-.417-.028-.585-.083-.166-.75-1.808-1.028-2.475-.27-.65-.545-.562-.75-.573-.194-.01-.417-.012-.639-.012-.222 0-.583.083-.888.417-.305.333-1.166 1.14-1.166 2.782 0 1.642 1.194 3.228 1.361 3.45.166.223 2.35 3.588 5.695 5.032.796.343 1.417.548 1.901.702.799.254 1.526.218 2.101.132.641-.096 1.97-.805 2.248-1.583.278-.778.278-1.445.194-1.583-.083-.14-.305-.223-.639-.39Z" />
      </svg>
    </motion.a>
  );
}
