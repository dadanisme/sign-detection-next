import clsx from "clsx";
import React, { useState, createContext } from "react";
import { BsChatText } from "react-icons/bs";
import Chat from "@/components/chat";

interface Props {
  children: React.ReactNode;
}

export interface ChatProps {
  text: string;
  name: string;
}

interface ContextProps {
  chats: ChatProps[];
  setChats: React.Dispatch<React.SetStateAction<ChatProps[]>>;
  addChat: (chat: ChatProps) => void;
}

export const ChatContext = createContext<ContextProps>({
  chats: [],
  setChats: () => {},
  addChat: () => {},
});

export default function Layout({ children }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chats, setChats] = useState<ChatProps[]>([]);

  const addChat = (chat: ChatProps) => {
    setChats((prevState) => [...prevState, chat]);
  };

  return (
    <ChatContext.Provider value={{ chats, setChats, addChat }}>
      <div className="h-screen overflow-hidden">
        <aside
          className={clsx(
            "fixed top-0 h-full w-96 bg-gray-200 shadow-lg p-4",
            "transition-all duration-300 ease-in-out z-[999] transform"
          )}
          style={{
            right: isOpen ? 0 : "-100%",
          }}
        >
          <Chat />
        </aside>
        <BsChatText
          className="fixed text-2xl cursor-pointer transition-all duration-300 ease-in-out z-[1000]"
          style={{
            top: "1rem",
            right: isOpen ? "25rem" : "1rem",
            color: "#fff",
          }}
          onClick={() => setIsOpen((prevState) => !prevState)}
        />

        {children}
      </div>
    </ChatContext.Provider>
  );
}
