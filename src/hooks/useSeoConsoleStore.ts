// PRISM SEO Console - Local Storage Hook

import { useState, useEffect } from 'react';
import {
  Redirect,
  SitemapUrl,
  SchemaSnippet,
  GlossaryEntry,
  DrillCard,
  CalloutBlock,
  RelatedContentBlock
} from '@/types/seo-console';
import { seedGlossaryEntries, seedSchemaExamples } from '@/lib/seo-console-seed';

interface SeoConsoleStore {
  redirects: Redirect[];
  sitemapUrls: SitemapUrl[];
  schemaSnippets: SchemaSnippet[];
  glossaryEntries: GlossaryEntry[];
  drillCards: DrillCard[];
  callouts: CalloutBlock[];
  relatedContent: RelatedContentBlock[];
}

const STORAGE_KEY = 'prism-seo-console-data';

const getInitialStore = (): SeoConsoleStore => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        sitemapUrls: parsed.sitemapUrls?.map((url: any) => ({
          ...url,
          lastmod: new Date(url.lastmod)
        })) || [],
        schemaSnippets: parsed.schemaSnippets?.map((schema: any) => ({
          ...schema,
          createdAt: new Date(schema.createdAt)
        })) || [],
        glossaryEntries: parsed.glossaryEntries?.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt)
        })) || []
      };
    } catch {
      return getDefaultStore();
    }
  }
  return getDefaultStore();
};

const getDefaultStore = (): SeoConsoleStore => {
  // Seed with default glossary entries and schema examples
  const now = new Date();
  return {
    redirects: [],
    sitemapUrls: [],
    schemaSnippets: seedSchemaExamples.map((example, idx) => ({
      id: `seed-schema-${idx}`,
      type: example.type,
      name: example.name,
      payload: example.payload,
      createdAt: now
    })),
    glossaryEntries: seedGlossaryEntries.map((entry, idx) => ({
      ...entry,
      id: `seed-glossary-${idx}`,
      createdAt: now
    })),
    drillCards: [],
    callouts: [],
    relatedContent: []
  };
};

export const useSeoConsoleStore = () => {
  const [store, setStore] = useState<SeoConsoleStore>(getInitialStore);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const addRedirect = (redirect: Omit<Redirect, 'id'>) => {
    setStore(prev => ({
      ...prev,
      redirects: [...prev.redirects, { ...redirect, id: crypto.randomUUID() }]
    }));
  };

  const updateRedirect = (id: string, updates: Partial<Redirect>) => {
    setStore(prev => ({
      ...prev,
      redirects: prev.redirects.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const deleteRedirect = (id: string) => {
    setStore(prev => ({
      ...prev,
      redirects: prev.redirects.filter(r => r.id !== id)
    }));
  };

  const bulkAddRedirects = (redirects: Omit<Redirect, 'id'>[]) => {
    setStore(prev => ({
      ...prev,
      redirects: [
        ...prev.redirects,
        ...redirects.map(r => ({ ...r, id: crypto.randomUUID() }))
      ]
    }));
  };

  const addSitemapUrl = (url: Omit<SitemapUrl, 'id'>) => {
    setStore(prev => ({
      ...prev,
      sitemapUrls: [...prev.sitemapUrls, { ...url, id: crypto.randomUUID() }]
    }));
  };

  const updateSitemapUrl = (id: string, updates: Partial<SitemapUrl>) => {
    setStore(prev => ({
      ...prev,
      sitemapUrls: prev.sitemapUrls.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  };

  const deleteSitemapUrl = (id: string) => {
    setStore(prev => ({
      ...prev,
      sitemapUrls: prev.sitemapUrls.filter(u => u.id !== id)
    }));
  };

  const addSchemaSnippet = (snippet: Omit<SchemaSnippet, 'id' | 'createdAt'>) => {
    setStore(prev => ({
      ...prev,
      schemaSnippets: [
        ...prev.schemaSnippets,
        { ...snippet, id: crypto.randomUUID(), createdAt: new Date() }
      ]
    }));
  };

  const deleteSchemaSnippet = (id: string) => {
    setStore(prev => ({
      ...prev,
      schemaSnippets: prev.schemaSnippets.filter(s => s.id !== id)
    }));
  };

  const addGlossaryEntry = (entry: Omit<GlossaryEntry, 'id' | 'createdAt'>) => {
    setStore(prev => ({
      ...prev,
      glossaryEntries: [
        ...prev.glossaryEntries,
        { ...entry, id: crypto.randomUUID(), createdAt: new Date() }
      ]
    }));
  };

  const updateGlossaryEntry = (id: string, updates: Partial<GlossaryEntry>) => {
    setStore(prev => ({
      ...prev,
      glossaryEntries: prev.glossaryEntries.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteGlossaryEntry = (id: string) => {
    setStore(prev => ({
      ...prev,
      glossaryEntries: prev.glossaryEntries.filter(e => e.id !== id)
    }));
  };

  const addDrillCard = (card: Omit<DrillCard, 'id'>) => {
    setStore(prev => ({
      ...prev,
      drillCards: [...prev.drillCards, { ...card, id: crypto.randomUUID() }]
    }));
  };

  const deleteDrillCard = (id: string) => {
    setStore(prev => ({
      ...prev,
      drillCards: prev.drillCards.filter(c => c.id !== id)
    }));
  };

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStore(getDefaultStore());
  };

  return {
    ...store,
    addRedirect,
    updateRedirect,
    deleteRedirect,
    bulkAddRedirects,
    addSitemapUrl,
    updateSitemapUrl,
    deleteSitemapUrl,
    addSchemaSnippet,
    deleteSchemaSnippet,
    addGlossaryEntry,
    updateGlossaryEntry,
    deleteGlossaryEntry,
    addDrillCard,
    deleteDrillCard,
    clearAllData
  };
};
