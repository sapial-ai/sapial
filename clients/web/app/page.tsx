"use client";

import { useEffect, useRef } from "react";
import { useChat } from "ai/react";

import UserIcon from "./components/icons/UserIcon";
import OpenAiIcon from "./components/icons/OpenAiIcon";
import PaperAirplaneIcon from "./components/icons/PaperAirplaneIcon";

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
    <div className="justify-center container px-24 mx-auto">
      <div className="flex flex-col w-full gap-10 py-24" ref={messageRef}>
        <div className="flex-grow flex flex-col gap-3 mb-10">
          {messages.length > 0
            ? messages.map((m) => {
                const additionalStyles =
                  m.role === "user" ? "bg-neutral-200" : "";

                return (
                  <div
                    key={m.id}
                    className={`whitespace-pre-wrap flex gap-2 p-4 ${additionalStyles}`}
                  >
                    <div className="min-w-6">
                      {m.role === "user" ? <UserIcon /> : <OpenAiIcon />}
                    </div>
                    {m.content}
                  </div>
                );
              })
            : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="fixed bottom-0 w-full max-w-md 2xl:max-w-[82rem] mx-auto container"
        >
          <div className="w-full max-w-xl mx-auto">
            <div className="relative">
              <input
                className="block bottom-0 w-full text-sm text-gray-900 pr-10 max-w-xl p-4 mb-8 border border-gray-300 rounded shadow-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={input}
                placeholder="Send a message"
                onChange={handleInputChange}
              />
              <div className="absolute text-gray-400 inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <PaperAirplaneIcon />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
