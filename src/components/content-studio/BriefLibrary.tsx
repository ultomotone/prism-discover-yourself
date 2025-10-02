import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useContentStudioStore } from '@/hooks/useContentStudioStore';
import { FileText, Search, Download, Trash2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function BriefLibrary() {
  const { briefs, deleteBrief } = useContentStudioStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCluster, setFilterCluster] = useState<string>('all');

  const filteredBriefs = briefs.filter(brief => {
    const matchesSearch = brief.meta.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brief.keywordIntent.primary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCluster = filterCluster === 'all' || brief.keywordIntent.cluster === filterCluster;
    return matchesSearch && matchesCluster;
  });

  const handleDownloadMarkdown = (brief: typeof briefs[0]) => {
    const content = `---
title: ${brief.meta.title}
description: ${brief.meta.description}
slug: ${brief.meta.slug}
schema: ${brief.schema}
cluster: ${brief.keywordIntent.cluster}
persona: ${brief.keywordIntent.persona}
---

# ${brief.meta.title}

${brief.promiseOneLine}

## Outline

${brief.outline.map(h => `- ${h}`).join('\n')}

## FAQs

${brief.faq.map(f => `**${f.question}**\n\n${f.answer}\n`).join('\n')}

## Internal Links

- Pillar: ${brief.internalLinks.pillar}
- Siblings: ${brief.internalLinks.siblings.join(', ')}
- Glossary: ${brief.internalLinks.glossary}
- CTA: ${brief.internalLinks.cta.label} (${brief.internalLinks.cta.url})

---

PRISM content is educational and non-clinical. It is not a medical or psychological diagnosis or treatment.
`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.meta.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = (brief: typeof briefs[0]) => {
    const data = JSON.stringify(brief, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.meta.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brief Library</CardTitle>
          <CardDescription>
            Manage and export your content briefs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search briefs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'Pillar', 'Hub', 'Support', 'Glossary'].map(cluster => (
                <Button
                  key={cluster}
                  variant={filterCluster === cluster ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCluster(cluster)}
                >
                  {cluster}
                </Button>
              ))}
            </div>
          </div>

          {filteredBriefs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No briefs found</p>
              <p className="text-sm mt-1">Create your first brief to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBriefs.map(brief => (
                <Card key={brief.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{brief.meta.title}</CardTitle>
                        <CardDescription>
                          {brief.keywordIntent.primary} • {brief.keywordIntent.persona}
                        </CardDescription>
                      </div>
                      {brief.needsUpdate && (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Needs Update
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {brief.promiseOneLine}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{brief.keywordIntent.cluster}</Badge>
                      <Badge variant="outline">{brief.keywordIntent.intent}</Badge>
                      <Badge variant="outline">{brief.schema}</Badge>
                      {brief.keywordIntent.concepts.map(concept => (
                        <Badge key={concept} variant="secondary">{concept}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(brief.updatedAt, { addSuffix: true })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadMarkdown(brief)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          MD
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadJSON(brief)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          JSON
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteBrief(brief.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
