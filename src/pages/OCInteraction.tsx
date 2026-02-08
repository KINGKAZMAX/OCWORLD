import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { ChevronLeft, Plus, Play, RefreshCw, Sparkles, Loader2 } from "lucide-react";

interface Character {
  id: number;
  name: string;
  image: string;
  personality?: string[];
  mbti?: string;
  catchphrase?: string;
}

interface DialogueLine {
  id: string;
  characterId: number;
  characterName: string;
  characterImage: string;
  text: string;
  emotion?: string;
}

// Note: Demo characters removed - now using real data from API

// Interaction scenarios
const SCENARIOS = [
  { id: "meeting", name: "初次相遇", desc: "兩個角色偶然相遇" },
  { id: "battle", name: "戰鬥合作", desc: "共同面對敵人" },
  { id: "casual", name: "日常閒聊", desc: "輕鬆的對話" },
  { id: "conflict", name: "觀點衝突", desc: "意見不合的討論" },
  { id: "adventure", name: "冒險旅途", desc: "一起探索未知" },
];

export default function OCInteraction() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoadingChars, setIsLoadingChars] = useState(true);
  const [selectedOCs, setSelectedOCs] = useState<Character[]>([]);
  const [scenario, setScenario] = useState<string>("meeting");
  const [dialogues, setDialogues] = useState<DialogueLine[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load real characters from API
  useEffect(() => {
    async function loadCharacters() {
      try {
        // Load user's own characters
        const myRes = await client.api.fetch("/api/characters/my");
        const myData = await myRes.json();
        
        // Load community characters
        const communityRes = await client.api.fetch("/api/public/community?limit=20");
        const communityData = await communityRes.json();
        
        const allChars: Character[] = [];
        
        // Add user's characters
        if (myData.characters) {
          myData.characters.forEach((c: any) => {
            allChars.push({
              id: c.id,
              name: c.name,
              image: c.image || c.thumbnail || "🎭",
              personality: c.personalityTags ? JSON.parse(c.personalityTags) : [],
              mbti: c.mbti,
              catchphrase: c.catchphrase,
            });
          });
        }
        
        // Add community characters (avoid duplicates)
        if (communityData.characters) {
          communityData.characters.forEach((c: any) => {
            if (!allChars.find(existing => existing.id === c.id)) {
              allChars.push({
                id: c.id,
                name: c.name,
                image: c.image || c.thumbnail || "🎭",
                personality: c.personalityTags ? JSON.parse(c.personalityTags) : [],
                mbti: c.mbti,
                catchphrase: c.catchphrase,
              });
            }
          });
        }
        
        setCharacters(allChars);
      } catch (error) {
        console.error("Failed to load characters:", error);
      } finally {
        setIsLoadingChars(false);
      }
    }
    
    if (user) {
      loadCharacters();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dialogues]);

  const toggleCharacter = (char: Character) => {
    if (selectedOCs.find(c => c.id === char.id)) {
      setSelectedOCs(selectedOCs.filter(c => c.id !== char.id));
    } else if (selectedOCs.length < 3) {
      setSelectedOCs([...selectedOCs, char]);
    }
  };

  const generateInteraction = async () => {
    if (selectedOCs.length < 2) return;
    
    setIsGenerating(true);
    setDialogues([]);

    try {
      const res = await client.api.fetch("/api/oc-interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characters: selectedOCs.map(c => ({
            id: c.id,
            name: c.name,
            personality: c.personality,
            mbti: c.mbti,
            catchphrase: c.catchphrase,
          })),
          scenario,
        }),
      });

      const data = await res.json();
      
      if (data.dialogues) {
        // Animate dialogues one by one
        for (let i = 0; i < data.dialogues.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          const line = data.dialogues[i];
          const char = selectedOCs.find(c => c.name === line.character) || selectedOCs[i % selectedOCs.length];
          
          setDialogues(prev => [...prev, {
            id: `${Date.now()}-${i}`,
            characterId: char.id,
            characterName: char.name,
            characterImage: char.image,
            text: line.text,
            emotion: line.emotion,
          }]);
        }
      }
    } catch (error) {
      console.error("Interaction generation failed:", error);
      // Fallback demo dialogues
      const demoDialogues = generateDemoDialogues();
      for (let i = 0; i < demoDialogues.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setDialogues(prev => [...prev, demoDialogues[i]]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDemoDialogues = (): DialogueLine[] => {
    if (selectedOCs.length < 2) return [];
    const [char1, char2] = selectedOCs;
    
    const scenarioDialogues: Record<string, DialogueLine[]> = {
      meeting: [
        { id: "1", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: `你好，我是${char1.name}。很高興認識你。`, emotion: "friendly" },
        { id: "2", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: `幸會幸會，${char1.name}。我是${char2.name}。`, emotion: "curious" },
        { id: "3", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: char1.catchphrase || "這個世界真是充滿驚喜...", emotion: "thoughtful" },
        { id: "4", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: `有趣的說法。${char2.catchphrase || "我們或許可以成為朋友。"}`, emotion: "happy" },
      ],
      battle: [
        { id: "1", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: "敵人來了！準備戰鬥！", emotion: "alert" },
        { id: "2", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: "收到，我掩護你！", emotion: "determined" },
        { id: "3", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: "配合得不錯！再來！", emotion: "excited" },
        { id: "4", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: "勝利屬於我們！", emotion: "triumphant" },
      ],
      casual: [
        { id: "1", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: "今天天氣真好啊~", emotion: "relaxed" },
        { id: "2", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: "是啊，很適合出去走走。", emotion: "peaceful" },
        { id: "3", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: "要不要一起去那家新開的咖啡店？", emotion: "excited" },
        { id: "4", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: "好主意！走吧！", emotion: "happy" },
      ],
      conflict: [
        { id: "1", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: "我不同意你的看法。", emotion: "serious" },
        { id: "2", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: "那你說說你的理由？", emotion: "questioning" },
        { id: "3", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: "我認為...好吧，你說得有道理。", emotion: "thoughtful" },
        { id: "4", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: "哈哈，我們各有各的想法，這很正常。", emotion: "understanding" },
      ],
      adventure: [
        { id: "1", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: "看！前面就是傳說中的遺跡！", emotion: "excited" },
        { id: "2", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: "小心，可能有機關。", emotion: "cautious" },
        { id: "3", characterId: char1.id, characterName: char1.name, characterImage: char1.image, text: "發現寶藏了！太棒了！", emotion: "joyful" },
        { id: "4", characterId: char2.id, characterName: char2.name, characterImage: char2.image, text: "這次冒險真是值得！", emotion: "satisfied" },
      ],
    };
    
    return scenarioDialogues[scenario] || scenarioDialogues.meeting;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="glass border-b border-gray-200 p-4 safe-area-top sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold gradient-text">OC 互動劇場</h1>
          <Link to="/oc-social" className="ml-auto">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Sparkles className="w-4 h-4" />
              社交圈
            </Button>
          </Link>
        </div>
      </div>

      {/* Character Selection */}
      <div className="p-4 border-b-4 border-black bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm">選擇角色 ({selectedOCs.length}/3)</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSelector(!showSelector)}
            className="text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            {showSelector ? "收起" : "選擇"}
          </Button>
        </div>

        {/* Selected characters display */}
        <div className="flex gap-2 mb-3">
          {selectedOCs.length === 0 ? (
            <div className="text-gray-400 text-sm py-4 text-center w-full border-2 border-dashed border-gray-300">
              點擊「選擇」添加 2-3 個角色
            </div>
          ) : (
            selectedOCs.map((char, idx) => (
              <motion.div
                key={char.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <div 
                  className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center overflow-hidden cursor-pointer hover:bg-red-50"
                  onClick={() => toggleCharacter(char)}
                >
                  {char.image.startsWith("http") ? (
                    <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{char.image || "🎭"}</span>
                  )}
                </div>
                <span className="text-xs mt-1 font-bold truncate max-w-16">{char.name}</span>
              </motion.div>
            ))
          )}
        </div>

        {/* Character selector */}
        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {isLoadingChars ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-gray-500">載入角色中...</span>
                </div>
              ) : characters.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="mb-2">還沒有角色</p>
                  <Link to="/create" className="text-primary underline">去創建一個</Link>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 pt-3 border-t-2 border-black/20 max-h-48 overflow-y-auto">
                  {characters.map(char => (
                    <motion.div
                      key={char.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCharacter(char)}
                      className={`p-2 border-2 border-black cursor-pointer transition-colors ${
                        selectedOCs.find(c => c.id === char.id) 
                          ? "bg-primary text-white" 
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {char.image.startsWith("http") ? (
                        <img 
                          src={char.image} 
                          alt={char.name} 
                          className="w-full aspect-square object-cover border border-black"
                        />
                      ) : (
                        <div className="text-2xl text-center aspect-square flex items-center justify-center">
                          {char.image || "🎭"}
                        </div>
                      )}
                      <div className="text-xs text-center truncate mt-1">{char.name}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scenario Selection */}
      <div className="p-4 border-b-2 border-black/20 bg-white">
        <span className="font-bold text-sm block mb-2">互動場景</span>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              className={`px-3 py-2 border-2 border-black text-sm whitespace-nowrap transition-colors ${
                scenario === s.id 
                  ? "bg-accent text-black" 
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dialogue Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {dialogues.length === 0 && !isGenerating && (
          <div className="text-center text-gray-400 py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>選擇角色和場景後</p>
            <p>點擊「生成互動」開始</p>
          </div>
        )}

        <AnimatePresence>
          {dialogues.map((line, idx) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex gap-3 ${idx % 2 === 1 ? "flex-row-reverse" : ""}`}
            >
              <div className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                {line.characterImage.startsWith("http") ? (
                  <img src={line.characterImage} alt={line.characterName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{line.characterImage || "🎭"}</span>
                )}
              </div>
              <div className={`max-w-[70%] ${idx % 2 === 1 ? "text-right" : ""}`}>
                <span className="text-xs font-bold text-primary block mb-1">
                  {line.characterName}
                  {line.emotion && <span className="ml-2 text-gray-400">({line.emotion})</span>}
                </span>
                <div className={`p-3 border-4 border-black ${idx % 2 === 1 ? "bg-accent" : "bg-white"}`}>
                  <p className="text-sm">{line.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-4"
          >
            <div className="w-8 h-8 border-4 border-black border-t-primary animate-spin" />
            <span className="text-sm text-gray-500">角色們正在交流中...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t-4 border-black bg-white safe-area-bottom">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setDialogues([])}
            disabled={dialogues.length === 0 || isGenerating}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            清空
          </Button>
          <Button
            onClick={generateInteraction}
            disabled={selectedOCs.length < 2 || isGenerating}
            className="flex-[2] bg-primary text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {isGenerating ? "生成中..." : "生成互動"}
          </Button>
        </div>
      </div>
    </div>
  );
}
