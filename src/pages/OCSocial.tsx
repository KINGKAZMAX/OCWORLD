import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { 
  ChevronLeft, Heart, MessageCircle, Users, Sparkles, 
  RefreshCw, Play, Pause, Volume2, VolumeX, Send
} from "lucide-react";

interface Character {
  id: number;
  name: string;
  image: string | null;
  personalityTags: string | null;
  mbti: string | null;
  catchphrase: string | null;
}

interface SocialFeed {
  id: number;
  ocId: number;
  feedType: string;
  content: string;
  targetOcId: number | null;
  likes: number;
  createdAt: number;
  oc?: Character;
  targetOC?: Character;
}

interface DialogueLine {
  character: string;
  text: string;
  emotion: string;
}

interface Relationship {
  id: number;
  ocId: number;
  targetOcId: number;
  relationshipType: string;
  affinityScore: number;
  interactionCount: number;
  targetOC?: Character;
}

export default function OCSocial() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"feed" | "auto-chat" | "relationships">("feed");
  const [feeds, setFeeds] = useState<SocialFeed[]>([]);
  const [myOCs, setMyOCs] = useState<Character[]>([]);
  const [selectedOC, setSelectedOC] = useState<Character | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto-chat state
  const [chatOC1, setChatOC1] = useState<Character | null>(null);
  const [chatOC2, setChatOC2] = useState<Character | null>(null);
  const [dialogues, setDialogues] = useState<DialogueLine[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dialogues]);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      // Load social feed
      const feedRes = await client.api.fetch("/api/public/social-feed?limit=30");
      const feedData = await feedRes.json();
      setFeeds(feedData.feeds || []);
      
      // Load my OCs
      const myRes = await client.api.fetch("/api/characters/my");
      const myData = await myRes.json();
      setMyOCs(myData.characters || []);
      
      if (myData.characters?.length > 0) {
        setSelectedOC(myData.characters[0]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelationships = async (ocId: number) => {
    try {
      const res = await client.api.fetch(`/api/oc/${ocId}/relationships`);
      const data = await res.json();
      setRelationships(data.relationships || []);
    } catch (error) {
      console.error("Failed to load relationships:", error);
    }
  };

  useEffect(() => {
    if (selectedOC && activeTab === "relationships") {
      loadRelationships(selectedOC.id);
    }
  }, [selectedOC, activeTab]);

  const handleAutoSocial = async () => {
    if (!selectedOC) return;
    
    setIsGenerating(true);
    try {
      const res = await client.api.fetch("/api/oc/auto-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ocId: selectedOC.id }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Show the generated dialogue
        if (data.dialogues) {
          setDialogues(data.dialogues);
          setChatOC1(selectedOC);
          setChatOC2(data.friend);
          setActiveTab("auto-chat");
        }
        
        // Refresh feed
        loadData();
      }
    } catch (error) {
      console.error("Auto-social failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLikeFeed = async (feedId: number) => {
    try {
      await client.api.fetch(`/api/social-feed/${feedId}/like`, {
        method: "POST",
      });
      setFeeds(feeds.map(f => 
        f.id === feedId ? { ...f, likes: (f.likes || 0) + 1 } : f
      ));
    } catch (error) {
      console.error("Like failed:", error);
    }
  };

  // Auto-chat functions
  const startAutoChat = async () => {
    if (!chatOC1 || !chatOC2) return;
    
    setIsAutoPlaying(true);
    generateNextDialogue();
  };

  const stopAutoChat = () => {
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
  };

  const generateNextDialogue = async () => {
    if (!chatOC1 || !chatOC2) return;
    
    setIsGenerating(true);
    try {
      const res = await client.api.fetch("/api/oc/auto-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oc1Id: chatOC1.id,
          oc2Id: chatOC2.id,
          previousDialogues: dialogues.slice(-10),
          topic,
        }),
      });
      
      const data = await res.json();
      
      if (data.dialogues) {
        // Animate new dialogues one by one
        for (const line of data.dialogues) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setDialogues(prev => [...prev, line]);
        }
        
        if (data.suggestedTopic) {
          setTopic(data.suggestedTopic);
        }
      }
      
      // Continue if auto-playing
      if (isAutoPlaying) {
        autoPlayRef.current = setTimeout(generateNextDialogue, 3000);
      }
    } catch (error) {
      console.error("Auto-chat failed:", error);
      setIsAutoPlaying(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectChatPartner = (oc: Character) => {
    if (!chatOC1) {
      setChatOC1(oc);
    } else if (!chatOC2 && oc.id !== chatOC1.id) {
      setChatOC2(oc);
    }
  };

  const clearChatSelection = () => {
    setChatOC1(null);
    setChatOC2(null);
    setDialogues([]);
    setTopic("");
    stopAutoChat();
  };

  const getOCImage = (oc: Character | undefined) => {
    if (!oc) return "🎭";
    if (oc.image?.startsWith("http")) return null;
    return oc.image || "🎭";
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "剛才";
    if (hours < 24) return `${hours}小時前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="glass border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold gradient-text">OC 社交圈</h1>
          <div className="w-10" />
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 justify-center">
          {[
            { id: "feed", label: "動態", icon: MessageCircle },
            { id: "auto-chat", label: "自動對話", icon: Sparkles },
            { id: "relationships", label: "關係", icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-white/80 hover:bg-white text-gray-600"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {/* Feed Tab */}
        {activeTab === "feed" && (
          <div className="space-y-4">
            {/* Auto Social Button */}
            {selectedOC && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pixel-card p-4 bg-gradient-to-r from-primary/10 to-secondary/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                      {getOCImage(selectedOC) || (
                        <img src={selectedOC.image!} alt="" className="w-full h-full rounded-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{selectedOC.name}</p>
                      <p className="text-sm text-gray-500">讓 TA 自動去交朋友</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAutoSocial}
                    disabled={isGenerating}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    自動社交
                  </Button>
                </div>
                
                {/* OC Selector */}
                {myOCs.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {myOCs.map(oc => (
                      <button
                        key={oc.id}
                        onClick={() => setSelectedOC(oc)}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-sm transition-all ${
                          selectedOC?.id === oc.id
                            ? "bg-primary text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {oc.name}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Feed List */}
            {feeds.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>還沒有任何動態</p>
                <p className="text-sm">點擊「自動社交」讓你的 OC 開始交朋友吧！</p>
              </div>
            ) : (
              feeds.map((feed, index) => (
                <motion.div
                  key={feed.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="pixel-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                      {feed.oc ? (
                        getOCImage(feed.oc) || (
                          <img src={feed.oc.image!} alt="" className="w-full h-full rounded-full object-cover" />
                        )
                      ) : "🎭"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{feed.oc?.name || "未知角色"}</span>
                        {feed.targetOC && (
                          <>
                            <span className="text-gray-400">→</span>
                            <span className="text-primary">{feed.targetOC.name}</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{feed.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <button
                          onClick={() => handleLikeFeed(feed.id)}
                          className="flex items-center gap-1 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          {feed.likes || 0}
                        </button>
                        <span>{formatTime(feed.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Auto Chat Tab */}
        {activeTab === "auto-chat" && (
          <div className="space-y-4">
            {/* OC Selection */}
            {(!chatOC1 || !chatOC2) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pixel-card p-4"
              >
                <h3 className="font-semibold text-gray-800 mb-3">選擇兩個 OC 開始對話</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {myOCs.map(oc => (
                    <button
                      key={oc.id}
                      onClick={() => selectChatPartner(oc)}
                      disabled={(chatOC1?.id === oc.id) || (chatOC2?.id === oc.id)}
                      className={`p-3 rounded-xl transition-all ${
                        chatOC1?.id === oc.id || chatOC2?.id === oc.id
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl mb-2">
                        {getOCImage(oc) || (
                          <img src={oc.image!} alt="" className="w-full h-full rounded-full object-cover" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate">{oc.name}</p>
                    </button>
                  ))}
                </div>
                {chatOC1 && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-semibold">{chatOC1.name}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-400">{chatOC2?.name || "選擇對手"}</span>
                    </div>
                    <button
                      onClick={clearChatSelection}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      重選
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Chat Interface */}
            {chatOC1 && chatOC2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pixel-card overflow-hidden"
              >
                {/* Chat Header */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center text-xl z-10">
                        {getOCImage(chatOC1) || (
                          <img src={chatOC1.image!} alt="" className="w-full h-full rounded-full object-cover" />
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-secondary flex items-center justify-center text-xl">
                        {getOCImage(chatOC2) || (
                          <img src={chatOC2.image!} alt="" className="w-full h-full rounded-full object-cover" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{chatOC1.name} × {chatOC2.name}</p>
                      <p className="text-xs text-gray-500">AI 自動對話中...</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearChatSelection}
                    >
                      結束
                    </Button>
                    <Button
                      size="sm"
                      onClick={isAutoPlaying ? stopAutoChat : startAutoChat}
                      className={isAutoPlaying ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}
                    >
                      {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {dialogues.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>點擊播放按鈕開始自動對話</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {dialogues.map((line, index) => {
                        const isOC1 = line.character === chatOC1.name;
                        const currentOC = isOC1 ? chatOC1 : chatOC2;
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10, x: isOC1 ? -20 : 20 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            className={`flex gap-2 ${isOC1 ? "" : "flex-row-reverse"}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg flex-shrink-0">
                              {getOCImage(currentOC) || (
                                <img src={currentOC.image!} alt="" className="w-full h-full rounded-full object-cover" />
                              )}
                            </div>
                            <div className={`max-w-[70%] ${isOC1 ? "" : "text-right"}`}>
                              <p className="text-xs text-gray-500 mb-1">{line.character}</p>
                              <div className={`inline-block px-4 py-2 rounded-2xl ${
                                isOC1 
                                  ? "bg-white text-gray-800" 
                                  : "bg-primary text-white"
                              }`}>
                                <p className="text-sm">{line.text}</p>
                              </div>
                              {line.emotion && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {line.emotion === "happy" ? "😊" : 
                                   line.emotion === "curious" ? "🤔" :
                                   line.emotion === "excited" ? "🎉" :
                                   line.emotion === "sad" ? "😢" :
                                   line.emotion === "angry" ? "😤" : "💭"} {line.emotion}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                  
                  {isGenerating && (
                    <div className="flex justify-center py-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Topic / Next */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="輸入話題引導對話..."
                      className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <Button
                      onClick={generateNextDialogue}
                      disabled={isGenerating}
                      className="rounded-full"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Relationships Tab */}
        {activeTab === "relationships" && (
          <div className="space-y-4">
            {/* OC Selector */}
            {myOCs.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {myOCs.map(oc => (
                  <button
                    key={oc.id}
                    onClick={() => setSelectedOC(oc)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      selectedOC?.id === oc.id
                        ? "bg-primary text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                      {getOCImage(oc) || (
                        <img src={oc.image!} alt="" className="w-full h-full rounded-full object-cover" />
                      )}
                    </div>
                    {oc.name}
                  </button>
                ))}
              </div>
            )}

            {/* Relationships List */}
            {selectedOC && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">{selectedOC.name} 的社交關係</h3>
                
                {relationships.length === 0 ? (
                  <div className="pixel-card p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>還沒有建立任何關係</p>
                    <p className="text-sm">使用「自動社交」功能讓 TA 認識新朋友！</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relationships.map((rel, index) => (
                      <motion.div
                        key={rel.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="pixel-card p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
                              {rel.targetOC ? (
                                getOCImage(rel.targetOC) || (
                                  <img src={rel.targetOC.image!} alt="" className="w-full h-full rounded-full object-cover" />
                                )
                              ) : "🎭"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{rel.targetOC?.name || "未知角色"}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                  {rel.relationshipType === "friend" ? "朋友" :
                                   rel.relationshipType === "rival" ? "對手" :
                                   rel.relationshipType === "lover" ? "戀人" : rel.relationshipType}
                                </span>
                                <span>互動 {rel.interactionCount} 次</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Heart className="w-4 h-4 text-red-400" />
                              <span className="font-semibold text-gray-800">{rel.affinityScore}</span>
                            </div>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-400 to-pink-400 transition-all"
                                style={{ width: `${rel.affinityScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setChatOC1(selectedOC);
                              setChatOC2(rel.targetOC!);
                              setActiveTab("auto-chat");
                            }}
                            className="flex-1"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            對話
                          </Button>
                          <Link
                            to={`/chat/${rel.targetOcId}`}
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              <Send className="w-4 h-4 mr-1" />
                              聊天
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
