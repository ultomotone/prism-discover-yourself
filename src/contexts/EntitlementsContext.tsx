import React, { createContext, useContext } from 'react';
import { useEntitlements, type EntitlementData } from '@/hooks/useEntitlements';

const EntitlementsContext = createContext<EntitlementData | null>(null);

export function EntitlementsProvider({ children }: { children: React.ReactNode }) {
  const entitlements = useEntitlements();

  return (
    <EntitlementsContext.Provider value={entitlements}>
      {children}
    </EntitlementsContext.Provider>
  );
}

export function useEntitlementsContext(): EntitlementData {
  const context = useContext(EntitlementsContext);
  if (!context) {
    throw new Error('useEntitlementsContext must be used within EntitlementsProvider');
  }
  return context;
}
