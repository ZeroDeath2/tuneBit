"use client";

import { create } from "zustand";

type Modal = "stats" | "share" | "auth" | null;

interface UiStore {
  activeModal: Modal;
  activeCategory: string;
  activeLanguage: string;
  activeDifficulty: string;
  isOffline: boolean;

  openModal: (modal: Modal) => void;
  closeModal: () => void;
  setActiveCategory: (slug: string) => void;
  setActiveLanguage: (lang: string) => void;
  setActiveDifficulty: (diff: string) => void;
  setOffline: (v: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeModal: null,
  activeCategory: "all",
  activeLanguage: "all",
  activeDifficulty: "normal",
  isOffline: false,

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setActiveCategory: (slug) => set({ activeCategory: slug }),
  setActiveLanguage: (lang) => set({ activeLanguage: lang }),
  setActiveDifficulty: (diff) => set({ activeDifficulty: diff }),
  setOffline: (v) => set({ isOffline: v }),
}));
