// PRISM Content Studio - Local Storage Hook

import { useState, useEffect } from 'react';
import {
  Brief,
  UrlInventory,
  LinkSuggestion,
  CalloutBlock,
  FigurePlan,
  CannibalizationWarning
} from '@/types/content-studio';

interface ContentStudioStore {
  briefs: Brief[];
  urlInventory: UrlInventory[];
  linkSuggestions: LinkSuggestion[];
  callouts: CalloutBlock[];
  figurePlans: FigurePlan[];
  cannibalizationWarnings: CannibalizationWarning[];
}

const STORAGE_KEY = 'prism-content-studio-data';

const getInitialStore = (): ContentStudioStore => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        briefs: parsed.briefs?.map((brief: any) => ({
          ...brief,
          createdAt: new Date(brief.createdAt),
          updatedAt: new Date(brief.updatedAt)
        })) || []
      };
    } catch {
      return getDefaultStore();
    }
  }
  return getDefaultStore();
};

const getDefaultStore = (): ContentStudioStore => {
  return {
    briefs: [],
    urlInventory: [],
    linkSuggestions: [],
    callouts: [],
    figurePlans: [],
    cannibalizationWarnings: []
  };
};

export const useContentStudioStore = () => {
  const [store, setStore] = useState<ContentStudioStore>(getInitialStore);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const addBrief = (brief: Omit<Brief, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    setStore(prev => ({
      ...prev,
      briefs: [
        ...prev.briefs,
        {
          ...brief,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          needsUpdate: false
        }
      ]
    }));
  };

  const updateBrief = (id: string, updates: Partial<Brief>) => {
    setStore(prev => ({
      ...prev,
      briefs: prev.briefs.map(b =>
        b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
      )
    }));
  };

  const deleteBrief = (id: string) => {
    setStore(prev => ({
      ...prev,
      briefs: prev.briefs.filter(b => b.id !== id)
    }));
  };

  const addUrlInventory = (url: Omit<UrlInventory, 'id'>) => {
    setStore(prev => ({
      ...prev,
      urlInventory: [...prev.urlInventory, { ...url, id: crypto.randomUUID() }]
    }));
  };

  const bulkAddUrlInventory = (urls: Omit<UrlInventory, 'id'>[]) => {
    setStore(prev => ({
      ...prev,
      urlInventory: [
        ...prev.urlInventory,
        ...urls.map(u => ({ ...u, id: crypto.randomUUID() }))
      ]
    }));
  };

  const deleteUrlInventory = (id: string) => {
    setStore(prev => ({
      ...prev,
      urlInventory: prev.urlInventory.filter(u => u.id !== id)
    }));
  };

  const addLinkSuggestion = (suggestion: Omit<LinkSuggestion, 'id'>) => {
    setStore(prev => ({
      ...prev,
      linkSuggestions: [
        ...prev.linkSuggestions,
        { ...suggestion, id: crypto.randomUUID() }
      ]
    }));
  };

  const updateLinkSuggestion = (id: string, updates: Partial<LinkSuggestion>) => {
    setStore(prev => ({
      ...prev,
      linkSuggestions: prev.linkSuggestions.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
    }));
  };

  const deleteLinkSuggestion = (id: string) => {
    setStore(prev => ({
      ...prev,
      linkSuggestions: prev.linkSuggestions.filter(s => s.id !== id)
    }));
  };

  const addCallout = (callout: Omit<CalloutBlock, 'id'>) => {
    setStore(prev => ({
      ...prev,
      callouts: [...prev.callouts, { ...callout, id: crypto.randomUUID() }]
    }));
  };

  const deleteCallout = (id: string) => {
    setStore(prev => ({
      ...prev,
      callouts: prev.callouts.filter(c => c.id !== id)
    }));
  };

  const addFigurePlan = (figure: Omit<FigurePlan, 'id'>) => {
    setStore(prev => ({
      ...prev,
      figurePlans: [...prev.figurePlans, { ...figure, id: crypto.randomUUID() }]
    }));
  };

  const deleteFigurePlan = (id: string) => {
    setStore(prev => ({
      ...prev,
      figurePlans: prev.figurePlans.filter(f => f.id !== id)
    }));
  };

  const setCannibalizationWarnings = (warnings: CannibalizationWarning[]) => {
    setStore(prev => ({
      ...prev,
      cannibalizationWarnings: warnings
    }));
  };

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStore(getDefaultStore());
  };

  return {
    ...store,
    addBrief,
    updateBrief,
    deleteBrief,
    addUrlInventory,
    bulkAddUrlInventory,
    deleteUrlInventory,
    addLinkSuggestion,
    updateLinkSuggestion,
    deleteLinkSuggestion,
    addCallout,
    deleteCallout,
    addFigurePlan,
    deleteFigurePlan,
    setCannibalizationWarnings,
    clearAllData
  };
};
