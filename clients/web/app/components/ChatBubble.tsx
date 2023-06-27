import React from "react";
import UserIcon from "./icons/UserIcon";
import OpenAiIcon from "./icons/OpenAiIcon";

type ChatBubbleProps = {
  content: string;
  sender: "system" | "user" | "assistant";
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, sender }) => {
  const bubbleClasses =
    sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200";

  const containerClasses = sender === "user" ? "flex-row-reverse" : "flex-row";

  return (
    <div className={`flex gap-2 items-center ${containerClasses}`}>
      <div className="min-w-6">
        {sender === "user" ? <UserIcon /> : <OpenAiIcon />}
      </div>
      <div className={`p-3 rounded-lg whitespace-pre-wrap  ${bubbleClasses}`}>
        {content}
      </div>
    </div>
  );
};

export default ChatBubble;
