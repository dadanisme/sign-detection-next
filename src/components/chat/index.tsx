import React, { useContext, useRef } from "react";

import { AiOutlineSend } from "react-icons/ai";

import { ChatContext, ChatProps } from "@/layouts";

export default function Chat() {
  const inputRef = useRef<HTMLInputElement>(null);

  const { chats, setChats, addChat } = useContext(ChatContext);

  const handleAddChat = () => {
    if (inputRef.current?.value) {
      const chat: ChatProps = {
        name: "Text",
        text: inputRef.current.value,
      };

      addChat(chat);
      inputRef.current.value = "";
    }
  };

  return (
    <div className="h-full w-full flex flex-col gap-2">
      <div className="flex-1 border border-[#40128B] bg-white rounded-md p-2 overflow-auto">
        {chats.map((chat, index) => (
          <SingleChat chat={chat} key={index} />
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          className="w-full rounded-md border-[#40128B] h-8 px-2
          focus:outline-none focus:ring-1 focus:ring-[#40128B] text-sm"
          placeholder="Ketik pesan..."
          style={{
            borderWidth: 1,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddChat();
            }
          }}
          ref={inputRef}
        />
        <AiOutlineSend
          className="absolute top-2 right-2 text-[#40128B] cursor-pointer"
          onClick={handleAddChat}
        />
      </div>
    </div>
  );
}

function SingleChat({ chat }: { chat: ChatProps }) {
  return (
    <div className="mb-1">
      <p className="text-sm text-[#40128B]">
        <span className="font-bold text-amber-800">{chat.name}</span>:{" "}
        {chat.text}
      </p>
    </div>
  );
}
