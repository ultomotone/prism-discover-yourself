import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

type Entitlement = {
  id: string;
  user_id: string;
  product_code: string;
  active: boolean;
  granted_at: string;
  metadata?: {
    credits_used?: number;
    expires_at?: string;
  } | null;
};

export type EntitlementData = {
  isMember: boolean;
  membershipPlan: 'monthly' | 'annual' | 'lifetime' | null;
  advancedCreditsTotal: number;
  advancedCreditsUsed: number;
  advancedCreditsRemaining: number;
  advancedExpiresAt: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

export function useEntitlements(): EntitlementData {
  const { user } = useAuth();
  const [data, setData] = useState<EntitlementData>({
    isMember: false,
    membershipPlan: null,
    advancedCreditsTotal: 0,
    advancedCreditsUsed: 0,
    advancedCreditsRemaining: 0,
    advancedExpiresAt: null,
    loading: true,
    refetch: async () => {},
  });

  const fetchEntitlements = async () => {
    if (!user?.id) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true }));

      const { data: entitlements, error } = await supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .returns<Entitlement[]>();

      if (error) {
        console.error('Error fetching entitlements:', error);
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Check for membership
      const membershipEnt = entitlements?.find(e => 
        e.product_code.includes('prism_beta_membership_monthly') ||
        e.product_code.includes('prism_beta_membership_annual') ||
        e.product_code.includes('prism_beta_membership_lifetime')
      );

      const isMember = !!membershipEnt;
      let membershipPlan: 'monthly' | 'annual' | 'lifetime' | null = null;
      
      if (membershipEnt) {
        if (membershipEnt.product_code.includes('monthly')) membershipPlan = 'monthly';
        else if (membershipEnt.product_code.includes('annual')) membershipPlan = 'annual';
        else if (membershipEnt.product_code.includes('lifetime')) membershipPlan = 'lifetime';
      }

      // Check for Advanced pack
      const advancedEnt = entitlements?.find(e => 
        e.product_code === 'prism_adv_report_pack'
      );

      const advancedCreditsTotal = advancedEnt ? 2 : 0;
      const advancedCreditsUsed = advancedEnt?.metadata?.credits_used || 0;
      const advancedCreditsRemaining = Math.max(0, advancedCreditsTotal - advancedCreditsUsed);
      const advancedExpiresAt = advancedEnt?.metadata?.expires_at || null;

      setData({
        isMember,
        membershipPlan,
        advancedCreditsTotal,
        advancedCreditsUsed,
        advancedCreditsRemaining,
        advancedExpiresAt,
        loading: false,
        refetch: fetchEntitlements,
      });
    } catch (err) {
      console.error('Unexpected error fetching entitlements:', err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchEntitlements();
  }, [user?.id]);

  return data;
}
