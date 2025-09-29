import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp } from "lucide-react";

interface ROICalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ROICalculatorModal({ isOpen, onClose }: ROICalculatorModalProps) {
  const [inputs, setInputs] = useState({
    sdrCount: 10,
    averageACV: 25000,
    currentMeetingRate: 15, // meetings per month per SDR
    expectedLift: 25, // percentage improvement
  });

  const calculateROI = () => {
    const additionalMeetings = (inputs.sdrCount * inputs.currentMeetingRate * inputs.expectedLift) / 100;
    const monthlyAdditionalMeetings = additionalMeetings;
    const annualAdditionalMeetings = monthlyAdditionalMeetings * 12;
    
    // Assuming 20% of meetings convert to opportunities, 25% of opportunities close
    const additionalOpportunities = annualAdditionalMeetings * 0.2;
    const additionalDeals = additionalOpportunities * 0.25;
    const additionalRevenue = additionalDeals * inputs.averageACV;

    return {
      monthlyAdditionalMeetings: Math.round(monthlyAdditionalMeetings),
      annualAdditionalMeetings: Math.round(annualAdditionalMeetings),
      additionalOpportunities: Math.round(additionalOpportunities),
      additionalDeals: Math.round(additionalDeals),
      additionalRevenue: Math.round(additionalRevenue),
    };
  };

  const results = calculateROI();

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <Calculator className="mr-2 h-6 w-6" />
            ROI Calculator
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Current Metrics</h3>
            
            <div>
              <Label htmlFor="sdrCount">Number of SDRs/BDRs</Label>
              <Input
                id="sdrCount"
                type="number"
                value={inputs.sdrCount}
                onChange={(e) => handleInputChange("sdrCount", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="averageACV">Average Contract Value ($)</Label>
              <Input
                id="averageACV"
                type="number"
                value={inputs.averageACV}
                onChange={(e) => handleInputChange("averageACV", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="currentMeetingRate">Current Meetings per SDR/Month</Label>
              <Input
                id="currentMeetingRate"
                type="number"
                value={inputs.currentMeetingRate}
                onChange={(e) => handleInputChange("currentMeetingRate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="expectedLift">Expected Improvement (%)</Label>
              <Input
                id="expectedLift"
                type="number"
                value={inputs.expectedLift}
                onChange={(e) => handleInputChange("expectedLift", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Based on archetype-matched cadences and talk tracks
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
              Projected Impact
            </h3>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Additional Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{results.monthlyAdditionalMeetings}/month
                </div>
                <div className="text-sm text-muted-foreground">
                  {results.annualAdditionalMeetings} additional meetings annually
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Additional Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  +{results.additionalOpportunities}
                </div>
                <div className="text-sm text-muted-foreground">
                  Assuming 20% meeting-to-opportunity conversion
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Additional Closed Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  +{results.additionalDeals}
                </div>
                <div className="text-sm text-muted-foreground">
                  Assuming 25% opportunity-to-close conversion
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Additional Annual Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ${results.additionalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on ${inputs.averageACV.toLocaleString()} ACV
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg mt-6">
          <h4 className="font-semibold mb-2">Key Assumptions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 20% of meetings convert to qualified opportunities</li>
            <li>• 25% of opportunities close as deals</li>
            <li>• Improvements come from better archetype matching and messaging</li>
            <li>• Results compound over time as reps become more proficient</li>
          </ul>
        </div>

        <div className="flex gap-4 pt-4">
          <Button onClick={onClose} className="flex-1">
            Book a Pilot Review
          </Button>
          <Button variant="outline" onClick={onClose}>
            Download Full Model
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}