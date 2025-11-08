"use client";

import type { FC } from "react";

export interface ChatButtonProps {
  open: boolean;
  onToggle: () => void;
}

const ChatButton: FC<ChatButtonProps> = ({ open, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? "Close chat" : "Open chat"}
      className="fixed bottom-4 right-4 z-[9999] rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 w-14 h-14 flex items-center justify-center text-sm font-semibold"
    >
      {open ? "Close" : "Chat"}
    </button>
  );
};

export default ChatButton;
