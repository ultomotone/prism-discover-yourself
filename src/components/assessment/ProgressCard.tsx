import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidationPayload } from "@/utils/prismValidation";
import { PrismConfig } from "@/services/prismConfig";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ProgressCardProps {
  validation: ValidationPayload | null;
  config: PrismConfig | null;
  isLoading?: boolean;
}

export function ProgressCard({ validation, config, isLoading }: ProgressCardProps) {
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Assessment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading validation...</div>
        </CardContent>
      </Card>
    );
  }

  if (!validation || !config) {
    return null;
  }

  const { counts } = validation;

  const formatProgressItem = (
    label: string, 
    current: number, 
    expected: number, 
    isBoolean?: boolean,
    showNA?: boolean
  ) => {
    if (showNA && expected === 0) {
      return (
        <div className="flex justify-between items-center">
          <span className="text-sm">{label}:</span>
          <span className="text-xs text-muted-foreground">N/A</span>
        </div>
      );
    }

    if (isBoolean) {
      return (
        <div className="flex justify-between items-center">
          <span className="text-sm">{label}:</span>
          <span className="text-xs flex items-center gap-1">
            {current === 1 ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-600" />
                Present
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 text-red-600" />
                Missing
              </>
            )}
          </span>
        </div>
      );
    }

    const isComplete = current >= expected;
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm">{label}:</span>
        <span className={`text-xs ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
          {current}/{expected}
        </span>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          Assessment Progress
          {config.source === 'fallback' && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              Fallback config
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {formatProgressItem(
          "Forced-Choice", 
          counts.fc_answered, 
          counts.fc_expected
        )}
        {formatProgressItem(
          "INC Pairs", 
          counts.inc_pairs_complete, 
          counts.inc_pairs_present,
          false,
          true
        )}
        {formatProgressItem(
          "Attention Checks", 
          counts.ac_correct, 
          counts.ac_present,
          false,
          true
        )}
        {formatProgressItem(
          "Social Desirability", 
          counts.sd_present ? 1 : 0, 
          1,
          true
        )}
        
        {config.source === 'fallback' && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
            Running with fallback config. Your responses will still be validated.
          </div>
        )}
      </CardContent>
    </Card>
  );
}