import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "oc";
  text: string;
  timestamp: Date;
}

interface Character {
  id: number;
  name: string;
  image: string | null;
  personalityTags: string | null;
  mbti: string | null;
  catchphrase: string | null;
  story: string | null;
}

// Default character for fallback
const defaultCharacter: Character = {
  id: 0,
  name: "神秘旅者",
  image: null,
  personalityTags: JSON.stringify(["友善", "神秘"]),
  mbti: "INFJ",
  catchphrase: "每一次相遇都是命運的安排~",
  story: "一位來自遠方的神秘旅者，喜歡結交新朋友。",
};

export default function Chat() {
  const { ocId } = useParams<{ ocId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load character data from API
  useEffect(() => {
    const loadCharacter = async () => {
      if (!ocId) {
        setCharacter(defaultCharacter);
        setIsLoading(false);
        return;
      }

      try {
        const res = await client.api.fetch(`/api/public/characters/${ocId}`);
        const data = await res.json();
        
        if (data.character) {
          setCharacter(data.character);
        } else {
          setCharacter(defaultCharacter);
        }
      } catch (error) {
        console.error("Failed to load character:", error);
        setCharacter(defaultCharacter);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, [ocId]);

  // Initial greeting when character is loaded
  useEffect(() => {
    if (!character || isLoading) return;

    const personality = character.personalityTags 
      ? JSON.parse(character.personalityTags) 
      : ["友善"];
    
    const greetings = [
      `你好！我是${character.name}，很高興認識你~`,
      character.catchphrase || `嗨！在這裡遇見你真是太好了！`,
      `${personality[0] ? `作為一個${personality[0]}的角色，` : ""}我很期待和你聊天！`,
    ];

    setTimeout(() => {
      setMessages([
        {
          id: "greeting",
          sender: "oc",
          text: greetings[Math.floor(Math.random() * greetings.length)],
          timestamp: new Date(),
        },
      ]);
    }, 500);
  }, [character, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !character) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Call AI chat API
      const res = await client.api.fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: ocId || character.id,
          message: input,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();

      const ocResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "oc",
        text: data.reply || "...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, ocResponse]);
      setMessageCount((prev) => prev + 1);
    } catch (error) {
      console.error("Chat error:", error);
      // Fallback response on error
      const fallbackResponses = [
        "抱歉，我剛才走神了...你再說一次？",
        "嗯...讓我想想怎麼回答你~",
        "有點信號不好，不過我還在聽！",
      ];
      const ocResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "oc",
        text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, ocResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = ["你好！", "介紹一下你自己吧", "我們聊聊天~", "你喜歡什麼？"];

  // Get avatar display
  const getAvatar = () => {
    if (character?.image) {
      return (
        <img 
          src={character.image} 
          alt={character.name} 
          className="w-full h-full object-cover"
        />
      );
    }
    return <span className="text-2xl">🎭</span>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-500">載入角色中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="glass border-b border-gray-200 p-4 flex items-center gap-4 safe-area-top">
        <Link to="/radar" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <span className="text-xl">←</span>
        </Link>
        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
          {getAvatar()}
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-lg text-gray-800">{character?.name || "OC"}</h1>
          <p className="text-xs text-gray-400">
            {isTyping ? "正在輸入..." : "在線"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
          <span className="text-sm text-green-600">{messageCount} 條對話</span>
        </div>
      </div>

      {/* Chat hint banner */}
      <div className="bg-blue-50/80 backdrop-blur-sm p-3 text-center text-sm text-blue-600">
        <span className="bg-white px-2 py-0.5 rounded-md text-xs mr-2 text-gray-500">AI</span>
        角色會根據性格自動回覆
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                {msg.sender === "oc" && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    {getAvatar()}
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-white shadow-sm"
                  }`}
                >
                  {msg.sender === "oc" && (
                    <p className="text-xs font-medium text-primary mb-1">{character?.name}</p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
              {getAvatar()}
            </div>
            <div className="p-4 rounded-2xl bg-white shadow-sm">
              <div className="flex gap-1">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2 h-2 bg-gray-300 rounded-full"
                />
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  className="w-2 h-2 bg-gray-300 rounded-full"
                />
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                  className="w-2 h-2 bg-gray-300 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            onClick={() => setInput(reply)}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm whitespace-nowrap hover:bg-white shadow-sm active:scale-95 transition-all border border-gray-100"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 glass border-t border-gray-200 safe-area-bottom">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="輸入訊息..."
            className="flex-1 px-4 py-3 bg-white/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <Button onClick={sendMessage} className="px-6 rounded-xl" disabled={isTyping}>
            發送
          </Button>
        </div>
      </div>
    </div>
  );
}
