import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateStore, type StyleId } from '@/store/createStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Wand2, RefreshCw, Save, LogIn } from 'lucide-react';
import { client } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const STYLES: { id: StyleId; name: string; desc: string; color: string; icon: string }[] = [
  { id: 'pixel', name: '像素', desc: '復古 16-bit 風格', color: '#3d4852', icon: '🎮' },
  { id: 'anime', name: '動漫', desc: '日系賽璐珞風格', color: '#5a9e9e', icon: '✨' },
  { id: 'cyberpunk', name: '賽博', desc: '霓虹高科技', color: '#4a6fa5', icon: '🌃' },
  { id: 'chinese', name: '國風', desc: '傳統東方美學', color: '#b5838d', icon: '🏮' },
  { id: 'realistic', name: '寫實', desc: '照片級細節', color: '#6b7280', icon: '📷' },
  { id: 'chibi', name: 'Q版', desc: '可愛萌系', color: '#d4a64a', icon: '🎀' },
  { id: 'gothic', name: '哥特', desc: '暗黑神秘', color: '#374151', icon: '🦇' },
  { id: 'fantasy', name: '奇幻', desc: '魔法世界', color: '#8b5e3c', icon: '🔮' },
  { id: 'urban', name: '都市', desc: '現代潮流', color: '#4b5563', icon: '🏙️' },
];

export default function Create() {
  const { step, setStep } = useCreateStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      {/* Progress Bar */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex justify-between mb-3 text-sm text-gray-500 font-medium">
          <span className={step >= 1 ? 'text-primary' : ''}>風格</span>
          <span className={step >= 2 ? 'text-primary' : ''}>描述</span>
          <span className={step >= 3 ? 'text-primary' : ''}>生成</span>
          <span className={step >= 4 ? 'text-primary' : ''}>完成</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="w-full max-w-4xl flex-1 relative">
        <AnimatePresence mode="wait">
          {step === 1 && <StepStyle key="step1" />}
          {step === 2 && <StepDescribe key="step2" />}
          {step === 3 && <StepLoading key="step3" />}
          {step === 4 && <StepResult key="step4" />}
          {step === 5 && <StepEdit key="step5" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepStyle() {
  const { styleId, setStyleId, setStep } = useCreateStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-6 pixel-text-shadow">選擇風格</h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {STYLES.map((s) => (
          <motion.div
            key={s.id}
            onClick={() => setStyleId(s.id)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "pixel-card p-3 cursor-pointer hover:-translate-y-1 transition-all relative overflow-hidden group",
              styleId === s.id ? "ring-4 ring-primary ring-offset-2" : ""
            )}
          >
            {/* Color background */}
            <div 
              className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity" 
              style={{ backgroundColor: s.color }} 
            />
            
            {/* Icon */}
            <div className="text-3xl mb-2 relative z-10">{s.icon}</div>
            
            {/* Name */}
            <span className="text-sm font-bold block relative z-10">{s.name}</span>
            
            {/* Description */}
            <span className="text-xs text-gray-500 relative z-10 hidden md:block">{s.desc}</span>
            
            {/* Selected indicator */}
            {styleId === s.id && (
              <motion.div 
                layoutId="styleIndicator"
                className="absolute bottom-1 right-1 w-3 h-3 bg-primary"
              />
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex justify-end mt-auto">
        <Button 
          size="lg" 
          disabled={!styleId} 
          onClick={() => setStep(2)}
          className="text-lg px-8"
        >
          下一步 <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
}

function StepDescribe() {
  const { styleId, description, setDescription, setStep, setGeneratedImages } = useCreateStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setStep(3);
    setIsGenerating(true);

    try {
      const res = await client.api.fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styleId, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images);
        setStep(4);
      } else {
        throw new Error('No images generated');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message);
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-4 pixel-text-shadow">描述你的角色</h2>
      <p className="text-gray-500 text-sm mb-4">
        描述角色的外觀、服裝、表情、背景等特徵，越詳細效果越好
      </p>
      {error && (
        <div className="bg-red-100 border-4 border-red-500 p-4 mb-4 text-red-700">
          {error}
        </div>
      )}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="例如：粉色頭髮的少女，穿著霓虹夾克，站在雨中的賽博街道..."
        className="w-full h-48 md:h-64 p-4 text-base border-4 border-black shadow-pixel focus:outline-none focus:ring-4 focus:ring-primary resize-none mb-4"
      />
      
      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['少女', '少年', '精靈', '戰士', '魔法師', '機甲'].map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => setDescription(prev => prev ? `${prev}，${tag}` : tag)}
            className="px-3 py-1 text-sm border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          >
            + {tag}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between mt-auto">
        <Button variant="outline" onClick={() => setStep(1)} size="lg">
          <ChevronLeft className="mr-2 w-5 h-5" /> 返回
        </Button>
        <Button 
          size="lg" 
          disabled={!description || isGenerating} 
          onClick={handleGenerate}
          className="text-lg px-6 bg-accent text-black"
        >
          生成 <Wand2 className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
}

function StepLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px]"
    >
      <motion.div 
        className="w-24 h-24 border-8 border-black border-t-primary mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <h2 className="text-2xl font-bold animate-pulse">AI 正在創作...</h2>
      <p className="text-lg mt-4 text-gray-500">連接像素次元中</p>
      
      {/* Progress hints */}
      <motion.div 
        className="mt-8 text-sm text-gray-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        預計需要 10-30 秒
      </motion.div>
    </motion.div>
  );
}

function StepResult() {
  const { generatedImages, selectedImage, setSelectedImage, setStep } = useCreateStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <h2 className="text-3xl font-bold mb-6 pixel-text-shadow">SELECT YOUR CHARACTER</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {generatedImages.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={cn(
              "pixel-card overflow-hidden cursor-pointer aspect-square",
              selectedImage === img ? "ring-4 ring-primary ring-offset-2" : ""
            )}
          >
            <img src={img} alt={`Generated ${idx}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-auto">
        <Button variant="outline" onClick={() => setStep(2)} size="lg">
          <RefreshCw className="mr-2 w-6 h-6" /> REGENERATE
        </Button>
        <Button 
          size="lg" 
          disabled={!selectedImage} 
          onClick={() => setStep(5)}
          className="text-xl px-8"
        >
          NEXT <ChevronRight className="ml-2 w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  );
}

function StepEdit() {
  const { selectedImage, characterInfo, setCharacterInfo, reset } = useCreateStore();
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const personalityOptions = ['活泼', '冷酷', '温柔', '神秘', '搞笑', '傲娇', '中二', '治愈'];
  const mbtiOptions = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await client.api.fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          ...characterInfo,
        }),
      });
      reset();
      navigate('/profile');
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <h2 className="text-3xl font-bold mb-6 pixel-text-shadow">CUSTOMIZE CHARACTER</h2>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Preview */}
        <div className="pixel-card overflow-hidden aspect-square">
          {selectedImage && <img src={selectedImage} alt="Character" className="w-full h-full object-cover" />}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="角色名称"
            value={characterInfo.name}
            onChange={(e) => setCharacterInfo({ name: e.target.value })}
            className="w-full p-4 border-4 border-black shadow-pixel focus:outline-none focus:ring-4 focus:ring-primary"
          />
          
          <select
            value={characterInfo.gender}
            onChange={(e) => setCharacterInfo({ gender: e.target.value })}
            className="w-full p-4 border-4 border-black shadow-pixel focus:outline-none focus:ring-4 focus:ring-primary bg-white"
          >
            <option value="">选择性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>

          <select
            value={characterInfo.mbti}
            onChange={(e) => setCharacterInfo({ mbti: e.target.value })}
            className="w-full p-4 border-4 border-black shadow-pixel focus:outline-none focus:ring-4 focus:ring-primary bg-white"
          >
            <option value="">选择 MBTI</option>
            {mbtiOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <div>
            <p className="mb-2 font-bold">性格标签</p>
            <div className="flex flex-wrap gap-2">
              {personalityOptions.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const arr = characterInfo.personality;
                    setCharacterInfo({
                      personality: arr.includes(p) ? arr.filter(x => x !== p) : [...arr, p]
                    });
                  }}
                  className={cn(
                    "px-3 py-1 border-2 border-black text-sm",
                    characterInfo.personality.includes(p) ? "bg-primary text-white" : "bg-white"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="口头禅"
            value={characterInfo.catchphrase}
            onChange={(e) => setCharacterInfo({ catchphrase: e.target.value })}
            className="w-full p-4 border-4 border-black shadow-pixel focus:outline-none focus:ring-4 focus:ring-primary"
          />

          <textarea
            placeholder="角色故事..."
            value={characterInfo.story}
            onChange={(e) => setCharacterInfo({ story: e.target.value })}
            className="w-full h-32 p-4 border-4 border-black shadow-pixel focus:outline-none focus:ring-4 focus:ring-primary resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between mt-auto">
        <Button variant="outline" onClick={() => useCreateStore.getState().setStep(4)} size="lg">
          <ChevronLeft className="mr-2 w-6 h-6" /> BACK
        </Button>
        <Button 
          size="lg" 
          disabled={!characterInfo.name || isSaving}
          onClick={handleSave}
          className="text-xl px-8 bg-secondary"
        >
          <Save className="mr-2 w-6 h-6" /> SAVE
        </Button>
      </div>
    </motion.div>
  );
}
