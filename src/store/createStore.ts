import { create } from 'zustand';

export type StyleId = 'pixel' | 'anime' | 'cyberpunk' | 'chinese' | 'realistic' | 'chibi' | 'gothic' | 'fantasy' | 'urban';

interface CreateState {
  step: number;
  styleId: StyleId | null;
  description: string;
  generatedImages: string[];
  selectedImage: string | null;
  characterInfo: {
    name: string;
    gender: string;
    mbti: string;
    personality: string[];
    catchphrase: string;
    story: string;
  };
  setStep: (step: number) => void;
  setStyleId: (styleId: StyleId) => void;
  setDescription: (desc: string) => void;
  setGeneratedImages: (images: string[]) => void;
  setSelectedImage: (image: string) => void;
  setCharacterInfo: (info: Partial<CreateState['characterInfo']>) => void;
  reset: () => void;
}

export const useCreateStore = create<CreateState>((set) => ({
  step: 1,
  styleId: null,
  description: '',
  generatedImages: [],
  selectedImage: null,
  characterInfo: {
    name: '',
    gender: '',
    mbti: '',
    personality: [],
    catchphrase: '',
    story: '',
  },
  setStep: (step) => set({ step }),
  setStyleId: (styleId) => set({ styleId }),
  setDescription: (description) => set({ description }),
  setGeneratedImages: (generatedImages) => set({ generatedImages }),
  setSelectedImage: (selectedImage) => set({ selectedImage }),
  setCharacterInfo: (info) => set((state) => ({ characterInfo: { ...state.characterInfo, ...info } })),
  reset: () => set({
    step: 1,
    styleId: null,
    description: '',
    generatedImages: [],
    selectedImage: null,
    characterInfo: {
      name: '',
      gender: '',
      mbti: '',
      personality: [],
      catchphrase: '',
      story: '',
    }
  }),
}));
