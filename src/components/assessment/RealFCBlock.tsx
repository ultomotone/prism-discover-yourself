import React, { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface FCBlock {
  id: string;
  code: string;
  title: string;
  description?: string;
  order_index: number;
}

interface FCOption {
  id: string;
  option_code: string;
  prompt: string;
  weights_json: any; // Use any to handle Json type from Supabase
  order_index: number;
}

interface RealFCBlockProps {
  sessionId: string;
  onComplete: (allCompleted: boolean) => void;
  onAnswer: (blockId: string, optionId: string) => void;
}

export function RealFCBlock({ sessionId, onComplete, onAnswer }: RealFCBlockProps) {
  const [blocks, setBlocks] = useState<FCBlock[]>([]);
  const [options, setOptions] = useState<Record<string, FCOption[]>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFCBlocks();
  }, []);

  const loadFCBlocks = async () => {
    try {
      console.log('Loading real FC blocks from database...');
      
      // Load FC blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('fc_blocks')
        .select('*')
        .eq('version', 'v1.2')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (blocksError) throw blocksError;

      // Load FC options
      const { data: optionsData, error: optionsError } = await supabase
        .from('fc_options')
        .select('*')
        .order('order_index', { ascending: true });

      if (optionsError) throw optionsError;

      console.log('Loaded FC blocks:', blocksData?.length);
      console.log('Loaded FC options:', optionsData?.length);

      if (!blocksData || blocksData.length === 0) {
        throw new Error('No FC blocks found');
      }

      setBlocks((blocksData as unknown) as FCBlock[]);

      // Group options by block_id
      const optionsByBlock: Record<string, FCOption[]> = {};
      (optionsData as any[])?.forEach((option: any) => {
        if (!optionsByBlock[option.block_id]) {
          optionsByBlock[option.block_id] = [];
        }
        optionsByBlock[option.block_id].push(option as FCOption);
      });

      setOptions(optionsByBlock);

      // Load existing responses
      const { data: existingResponses } = await supabase
        .from('fc_responses')
        .select('block_id, option_id')
        .eq('session_id', sessionId);

      if (existingResponses) {
        const responseMap: Record<string, string> = {};
        (existingResponses as any[]).forEach((resp: any) => {
          responseMap[resp.block_id] = resp.option_id;
        });
        setResponses(responseMap);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading FC blocks:', error);
      setLoading(false);
    }
  };

  const currentBlock = blocks[currentBlockIndex];
  const currentOptions = currentBlock ? options[currentBlock.id] || [] : [];
  const currentResponse = currentBlock ? responses[currentBlock.id] : '';

  const handleAnswerChange = async (optionId: string) => {
    if (!currentBlock) return;

    setSaving(true);
    
    try {
      // Save to fc_responses table
      const { error } = await supabase
        .from('fc_responses')
        .upsert({
          session_id: sessionId,
          block_id: currentBlock.id,
          option_id: optionId,
          answered_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setResponses(prev => ({
        ...prev,
        [currentBlock.id]: optionId
      }));

      // Notify parent
      onAnswer(currentBlock.id, optionId);

      console.log(`FC response saved: block=${currentBlock.code}, option=${optionId}`);

      // Auto-advance to next block after a short delay
      setTimeout(() => {
        if (currentBlockIndex < blocks.length - 1) {
          setCurrentBlockIndex(prev => prev + 1);
        } else {
          // All blocks completed, call scoring
          handleAllBlocksCompleted();
        }
      }, 1000);

    } catch (error) {
      console.error('Error saving FC response:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAllBlocksCompleted = async () => {
    try {
      console.log('All FC blocks completed, calling score_fc_session...');
      
      const { data, error } = await supabase.functions.invoke('score_fc_session', {
        body: {
          session_id: sessionId,
          basis: 'functions',
          version: 'v1.2'
        }
      });

      if (error) {
        console.error('FC scoring error:', error);
      } else {
        console.log('FC scoring completed:', data);
      }

      onComplete(true);
    } catch (error) {
      console.error('Error in FC completion:', error);
      onComplete(true); // Still mark as complete even if scoring fails
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading Forced Choice blocks...</span>
        </CardContent>
      </Card>
    );
  }

  if (!currentBlock || currentOptions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">
            No Forced Choice blocks available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {currentBlock.title} ({currentBlockIndex + 1} of {blocks.length})
        </CardTitle>
        {currentBlock.description && (
          <p className="text-sm text-muted-foreground">
            {currentBlock.description}
          </p>
        )}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentBlockIndex + 1) / blocks.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={currentResponse} 
          onValueChange={handleAnswerChange}
          className="space-y-3"
          disabled={saving}
        >
          {currentOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.id} 
                id={option.id}
                disabled={saving}
              />
              <Label 
                htmlFor={option.id}
                className={`flex-1 cursor-pointer leading-relaxed ${
                  saving ? 'opacity-50' : ''
                }`}
              >
                {option.prompt}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {saving && (
          <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving response...
          </div>
        )}
      </CardContent>
    </Card>
  );
}