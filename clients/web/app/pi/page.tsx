"use client";
import { useEffect, useRef } from "react";
import { useChat } from "ai/react";

import AnimatedList from "../components/AnimatedList";

export default function Chat() {
  const messageRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  return (
    <div className="w-full min-h-screen bg-[#faf6ea]">
      <div className="justify-center container px-24 mx-auto">
        <div
          className="scroll-smooth mx-auto flex w-full max-w-xl flex-1 flex-col will-change-transform 2xl:max-w-2.5xl"
          ref={messageRef}
        >
          <div className="flex w-full flex-col">
            <div className="text-xl 2xl:text-2xl w-full origin-top-left">
              {messages.length > 0 ? <AnimatedList items={messages} /> : null}
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md 2xl:max-w-[82rem] mx-auto container pt-10 pb-10"
          >
            <input
              className="h-full w-full resize-none text-[#16330F]/50 border-none bg-transparent outline-none caret-color-gray-500 leading-6 font-semibold overflow-y-hidden"
              value={input}
              spellCheck={false}
              style={{ height: "28px !important" }}
              autoFocus={true}
              onChange={handleInputChange}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
