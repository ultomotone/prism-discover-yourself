import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useContentStudioStore } from '@/hooks/useContentStudioStore';
import { INTERNAL_LINK_RULES, UrlType } from '@/types/content-studio';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Link, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function LinkAssistant() {
  const {
    urlInventory,
    bulkAddUrlInventory,
    linkSuggestions,
    addLinkSuggestion,
    updateLinkSuggestion,
    cannibalizationWarnings,
    setCannibalizationWarnings
  } = useContentStudioStore();
  const { toast } = useToast();
  const [csvInput, setCsvInput] = useState('');

  const handleImportCSV = () => {
    try {
      const lines = csvInput.trim().split('\n');
      const headers = lines[0].toLowerCase().split(',');
      
      const urlIndex = headers.indexOf('url');
      const titleIndex = headers.indexOf('title');
      const typeIndex = headers.indexOf('type');
      const primaryIndex = headers.indexOf('primary topic');
      const secondaryIndex = headers.indexOf('secondary topics');

      if (urlIndex === -1 || titleIndex === -1 || typeIndex === -1) {
        throw new Error('CSV must have url, title, and type columns');
      }

      const urls = lines.slice(1).map(line => {
        const cols = line.split(',');
        return {
          url: cols[urlIndex]?.trim(),
          title: cols[titleIndex]?.trim(),
          type: cols[typeIndex]?.trim() as UrlType,
          primaryTopic: cols[primaryIndex]?.trim() || '',
          secondaryTopics: cols[secondaryIndex]?.split(';').map(s => s.trim()) || []
        };
      }).filter(u => u.url && u.title && u.type);

      bulkAddUrlInventory(urls);
      
      // Check for cannibalization
      detectCannibalization(urls);
      
      // Generate link suggestions
      generateLinkSuggestions();
      
      setCsvInput('');
      toast({
        title: 'URLs imported',
        description: `Added ${urls.length} URLs to inventory`
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Invalid CSV format',
        variant: 'destructive'
      });
    }
  };

  const detectCannibalization = (urls: Array<{url: string; title: string; type: UrlType; primaryTopic: string; secondaryTopics: string[];}>) => {
    const warnings = [];
    const topicMap = new Map<string, typeof urls>();
    
    urls.forEach(url => {
      if (url.primaryTopic) {
        const key = url.primaryTopic.toLowerCase();
        if (!topicMap.has(key)) {
          topicMap.set(key, []);
        }
        topicMap.get(key)!.push(url);
      }
    });
    
    topicMap.forEach((urlsWithTopic, topic) => {
      if (urlsWithTopic.length > 1) {
        for (let i = 0; i < urlsWithTopic.length; i++) {
          for (let j = i + 1; j < urlsWithTopic.length; j++) {
            warnings.push({
              url1: urlsWithTopic[i].url,
              url2: urlsWithTopic[j].url,
              sharedTopic: topic,
              intent: 'Informational' as const,
              recommendation: 'Review needed—merge or re-target to avoid competition'
            });
          }
        }
      }
    });
    
    setCannibalizationWarnings(warnings);
  };

  const generateLinkSuggestions = () => {
    const suggestions = [];
    
    for (const rule of INTERNAL_LINK_RULES) {
      const fromUrls = urlInventory.filter(u => u.type === rule.fromType);
      const toUrls = urlInventory.filter(u => u.type === rule.toType);
      
      fromUrls.forEach(from => {
        toUrls.forEach(to => {
          if (from.id !== to.id) {
            const anchor = rule.anchorPatterns[0] || to.title;
            addLinkSuggestion({
              fromUrl: from.url,
              toUrl: to.url,
              anchor,
              rationale: rule.rationale,
              priority: rule.fromType === 'Pillar' || rule.toType === 'Pillar' ? 'High' : 'Med',
              enabled: true
            });
          }
        });
      });
    }
    
    // Add glossary links from all content
    const glossaryUrls = urlInventory.filter(u => u.type === 'Glossary');
    const contentUrls = urlInventory.filter(u => ['Hub', 'Support', 'Pillar'].includes(u.type));
    
    contentUrls.forEach(content => {
      glossaryUrls.forEach(glossary => {
        addLinkSuggestion({
          fromUrl: content.url,
          toUrl: glossary.url,
          anchor: `${glossary.title.split('-')[0]} explained`,
          rationale: 'Definitions and snippet capture',
          priority: 'Med',
          enabled: true
        });
      });
    });
    
    // Add conversion CTAs
    const ctaUrls = urlInventory.filter(u => ['Product', 'Coaching', 'Enterprise'].includes(u.type));
    contentUrls.forEach(content => {
      ctaUrls.forEach(cta => {
        addLinkSuggestion({
          fromUrl: content.url,
          toUrl: cta.url,
          anchor: cta.title,
          rationale: 'Intent alignment and conversion',
          priority: 'High',
          enabled: true
        });
      });
    });
  };

  const exportLinkMap = () => {
    const enabledSuggestions = linkSuggestions.filter(s => s.enabled);
    const csv = ['From,To,Anchor,Rationale,Priority']
      .concat(enabledSuggestions.map(s => 
        `${s.fromUrl},${s.toUrl},"${s.anchor}","${s.rationale}",${s.priority}`
      ))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prism-link-map.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Link map exported',
      description: `Exported ${enabledSuggestions.length} link suggestions`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import URL Inventory</CardTitle>
          <CardDescription>
            Paste CSV with columns: url, title, type, primary topic, secondary topics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full h-32 p-3 border rounded-md font-mono text-sm"
            placeholder="url,title,type,primary topic,secondary topics&#10;/guides/dimensionality,Dimensionality Guide,Pillar,cognitive development,skill depth;practice"
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
          />
          <Button onClick={handleImportCSV} disabled={!csvInput.trim()}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </CardContent>
      </Card>

      {cannibalizationWarnings.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cannibalization Warnings
            </CardTitle>
            <CardDescription>
              These URLs compete for the same topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cannibalizationWarnings.map((warning, idx) => (
                <div key={idx} className="p-3 bg-destructive/10 rounded-md space-y-1">
                  <p className="font-medium text-sm">{warning.sharedTopic}</p>
                  <p className="text-xs text-muted-foreground">{warning.url1}</p>
                  <p className="text-xs text-muted-foreground">{warning.url2}</p>
                  <p className="text-xs mt-2">{warning.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Link Suggestions</CardTitle>
              <CardDescription>
                {linkSuggestions.filter(s => s.enabled).length} of {linkSuggestions.length} enabled
              </CardDescription>
            </div>
            <Button
              onClick={exportLinkMap}
              disabled={linkSuggestions.filter(s => s.enabled).length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Link Map
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {linkSuggestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No link suggestions yet</p>
              <p className="text-sm mt-1">Import URL inventory to generate suggestions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="flex items-start gap-3 p-3 border rounded-md"
                >
                  <Checkbox
                    checked={suggestion.enabled}
                    onCheckedChange={(checked) => 
                      updateLinkSuggestion(suggestion.id, { enabled: !!checked })
                    }
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        suggestion.priority === 'High' ? 'default' :
                        suggestion.priority === 'Med' ? 'secondary' : 'outline'
                      }>
                        {suggestion.priority}
                      </Badge>
                      <span className="text-sm font-medium">{suggestion.anchor}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From: {suggestion.fromUrl}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      To: {suggestion.toUrl}
                    </p>
                    <p className="text-xs">{suggestion.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL Inventory</CardTitle>
          <CardDescription>
            {urlInventory.length} URLs tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {urlInventory.map(url => (
              <div
                key={url.id}
                className="flex items-center justify-between p-2 border rounded-md text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium">{url.title}</p>
                  <p className="text-xs text-muted-foreground">{url.url}</p>
                </div>
                <Badge variant="outline">{url.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
