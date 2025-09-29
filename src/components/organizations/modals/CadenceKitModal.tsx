import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, MessageSquare, Video, FileText, Download } from "lucide-react";

interface CadenceKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CadenceKitModal({ isOpen, onClose }: CadenceKitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sample Cadence Kit - "The Analyst" Archetype</DialogTitle>
          <p className="text-muted-foreground">
            Evidence-first buyer who values detailed analysis and comprehensive documentation
          </p>
        </DialogHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="objections">Objections</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Archetype Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge variant="outline">Information Elements</Badge>
                      <p className="text-sm mt-1">Data, research, case studies, ROI calculations</p>
                    </div>
                    <div>
                      <Badge variant="outline">Communication Style</Badge>
                      <p className="text-sm mt-1">Detailed, evidence-based, structured</p>
                    </div>
                    <div>
                      <Badge variant="outline">Decision Process</Badge>
                      <p className="text-sm mt-1">Thorough evaluation, multiple stakeholders, consensus-building</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cadence Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Sequence</span>
                        <Badge>7 touches</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Phone Calls</span>
                        <Badge>3 attempts</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Social Touches</span>
                        <Badge>2 LinkedIn</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Video Messages</span>
                        <Badge>1 custom</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Email #1: Research-Based Opener
                    </CardTitle>
                    <Badge variant="outline">Day 1</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h5 className="font-semibold">Subject:</h5>
                      <p className="text-sm bg-muted p-2 rounded">
                        {`Research insight: [Company]'s Q3 efficiency metrics`}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-semibold">Body:</h5>
                      <div className="text-sm bg-muted p-3 rounded space-y-2">
                        <p>Hi [Name],</p>
                        <p>I noticed [Company] recently reported [specific metric] in your Q3 earnings. Based on our analysis of similar companies in [industry], organizations with your profile typically see:</p>
                        <ul className="list-disc ml-4 space-y-1">
                          <li>15-20% efficiency gains in [specific area]</li>
                          <li>$XXk reduction in [cost category]</li>
                        </ul>
                        <p>Would you be interested in a 15-minute call to review the benchmark data and methodology?</p>
                        <p>Best,<br/>[Your name]</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Email #3: Case Study Follow-up
                    </CardTitle>
                    <Badge variant="outline">Day 7</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h5 className="font-semibold">Subject:</h5>
                      <p className="text-sm bg-muted p-2 rounded">
                        Case study: How [Similar Company] achieved 23% improvement
                      </p>
                    </div>
                    <div>
                      <h5 className="font-semibold">Body:</h5>
                      <div className="text-sm bg-muted p-3 rounded space-y-2">
                        <p>Hi [Name],</p>
                        <p>Following up on my previous email about efficiency benchmarks. I thought you'd find this case study relevant:</p>
                        <p><strong>[Similar Company]</strong> (similar size/industry) implemented our approach and achieved:</p>
                        <ul className="list-disc ml-4 space-y-1">
                          <li>23% improvement in [metric]</li>
                          <li>ROI of 3.2x within 8 months</li>
                          <li>Full methodology documentation attached</li>
                        </ul>
                        <p>Happy to walk through their implementation strategy if helpful.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Cold Call Script - The Analyst
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-semibold">Opening (15 seconds)</h5>
                    <div className="text-sm bg-muted p-3 rounded">
                      <p>"Hi [Name], this is [Your name] from [Company]. I'm calling because I've been researching [their industry] efficiency trends and noticed some interesting patterns that might be relevant to [Company]. Do you have 30 seconds for me to share what I found?"</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold">Value Proposition (30 seconds)</h5>
                    <div className="text-sm bg-muted p-3 rounded">
                      <p>"Based on our analysis of companies similar to yours, we've identified three key areas where organizations typically see 15-25% efficiency improvements. I have the benchmark data here if you're interested. Would it be helpful if I sent you the research summary?"</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold">Discovery Questions</h5>
                    <ul className="text-sm space-y-2">
                      <li>• "What metrics are you currently tracking for [specific area]?"</li>
                      <li>• "How do you typically evaluate solutions like this?"</li>
                      <li>• "What kind of documentation would be most helpful for your team?"</li>
                      <li>• "Who else would be involved in reviewing this type of data?"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    LinkedIn Outreach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-semibold">Connection Request</h5>
                    <div className="text-sm bg-muted p-3 rounded">
                      <p>"Hi [Name], I've been researching [industry] efficiency trends and found some interesting benchmarks that might be relevant to [Company]. Would love to connect and share the data."</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold">Follow-up Message</h5>
                    <div className="text-sm bg-muted p-3 rounded">
                      <p>"Thanks for connecting! As mentioned, I've compiled some benchmark data for [industry] companies. The research shows organizations like [Company] typically see 15-20% improvements in [specific metric]. Would you be interested in a brief call to review the methodology?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="objections" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Objections & Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-red-600">Objection: "Send me some information first"</h5>
                      <p className="text-sm bg-green-50 p-3 rounded border-l-4 border-green-500">
                        <strong>Response:</strong> "Absolutely, I have several resources that would be relevant. To make sure I send you the most applicable data, can you help me understand your current approach to [specific area]? That way I can tailor the research to your exact situation."
                      </p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-red-600">Objection: "We need to see ROI projections"</h5>
                      <p className="text-sm bg-green-50 p-3 rounded border-l-4 border-green-500">
                        <strong>Response:</strong> "That makes perfect sense. I have a detailed ROI model based on companies similar to yours. Would a 15-minute call work to walk through the assumptions and methodology? That way you can evaluate how it applies to your specific situation."
                      </p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-red-600">Objection: "We're not ready to make any decisions"</h5>
                      <p className="text-sm bg-green-50 p-3 rounded border-l-4 border-green-500">
                        <strong>Response:</strong> "I completely understand. This conversation isn't about making decisions today—it's about sharing some research that might be valuable for your planning process. Even if you're not looking at solutions for 6-12 months, having the benchmark data could be helpful for your strategy discussions."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button onClick={onClose} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Full Kit (PDF)
          </Button>
          <Button variant="outline" onClick={onClose}>
            See More Archetypes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}