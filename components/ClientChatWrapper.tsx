"use client";

import type { FC } from "react";
import { useCallback, useState } from "react";
import ChatButton from "./ChatButton";
import ChatWidget, { type ChatMessage } from "./ChatWidget";

const ClientChatWrapper: FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <ChatWidget open={open} onClose={handleClose} messages={messages} setMessages={setMessages} />
      <ChatButton open={open} onToggle={handleToggle} />
    </>
  );
};

export default ClientChatWrapper;
