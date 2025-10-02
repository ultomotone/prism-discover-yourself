import { useState } from 'react';
import { FileText, Link, Upload, Download, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContentStudioStore } from '@/hooks/useContentStudioStore';
import { BriefGenerator } from '@/components/content-studio/BriefGenerator';
import { BriefLibrary } from '@/components/content-studio/BriefLibrary';
import { LinkAssistant } from '@/components/content-studio/LinkAssistant';

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState('overview');
  const { briefs, urlInventory, linkSuggestions, cannibalizationWarnings } = useContentStudioStore();

  const needsUpdateCount = briefs.filter(b => b.needsUpdate).length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">PRISM Content Studio</h1>
        <p className="text-muted-foreground">
          Generate publication-ready briefs and manage internal link architecture
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create Brief</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="links">Link Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Briefs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{briefs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Content briefs created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">URL Inventory</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{urlInventory.length}</div>
                <p className="text-xs text-muted-foreground">
                  URLs tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Link Suggestions</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{linkSuggestions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Internal link opportunities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Update</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{needsUpdateCount}</div>
                <p className="text-xs text-muted-foreground">
                  Briefs requiring review
                </p>
              </CardContent>
            </Card>
          </div>

          {cannibalizationWarnings.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Cannibalization Warnings</CardTitle>
                <CardDescription>
                  These URLs share the same primary topic and intent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cannibalizationWarnings.map((warning, idx) => (
                    <div key={idx} className="p-3 bg-destructive/10 rounded-md">
                      <p className="font-medium text-sm">{warning.sharedTopic}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {warning.url1} vs {warning.url2}
                      </p>
                      <p className="text-xs mt-1">{warning.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setActiveTab('create')}
                className="w-full justify-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Brief
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('links')}
                className="w-full justify-start"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import URL Inventory
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('library')}
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Brief Library
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <BriefGenerator />
        </TabsContent>

        <TabsContent value="library">
          <BriefLibrary />
        </TabsContent>

        <TabsContent value="links">
          <LinkAssistant />
        </TabsContent>
      </Tabs>
    </div>
  );
}
