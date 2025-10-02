import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useContentStudioStore } from '@/hooks/useContentStudioStore';
import { PageType, Persona, PrismConcept, ClusterType, SchemaType, CTA_COPY } from '@/types/content-studio';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Save } from 'lucide-react';

export function BriefGenerator() {
  const { addBrief } = useContentStudioStore();
  const { toast } = useToast();
  
  // Form state
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [variants, setVariants] = useState('');
  const [pageType, setPageType] = useState<PageType>('Informational');
  const [persona, setPersona] = useState<Persona>('Individual');
  const [concepts, setConcepts] = useState<PrismConcept[]>([]);
  const [cluster, setCluster] = useState<ClusterType>('Hub');
  const [schema, setSchema] = useState<SchemaType>('Article');

  // Generated brief fields
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [promiseOneLine, setPromiseOneLine] = useState('');
  const [outline, setOutline] = useState('');
  const [faqs, setFaqs] = useState('');

  const toggleConcept = (concept: PrismConcept) => {
    if (concepts.includes(concept)) {
      setConcepts(concepts.filter(c => c !== concept));
    } else if (concepts.length < 2) {
      setConcepts([...concepts, concept]);
    }
  };

  const generateOutline = () => {
    const slug = primaryKeyword.toLowerCase().replace(/\s+/g, '-');
    setGeneratedSlug(slug);
    
    setMetaTitle(`${primaryKeyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - PRISM Dynamics`);
    setMetaDescription(`Learn about ${primaryKeyword} with PRISM Dynamics. Evidence-based guidance for ${persona.toLowerCase()}s.`);
    
    setPromiseOneLine(`Understand ${primaryKeyword} and apply it to your development journey.`);
    
    const baseOutline = [
      `What is ${primaryKeyword}?`,
      'Why it matters',
      'How to apply',
      'Tiny habits for daily practice',
      'Common pitfalls',
      'Next steps'
    ];
    
    if (concepts.includes('Dimensionality')) {
      baseOutline.splice(2, 0, '1D to 4D progression', 'Measuring your current level');
    }
    
    if (concepts.includes('Regulation/N_z')) {
      baseOutline.splice(3, 0, 'State regulation considerations');
    }
    
    if (concepts.includes('Relational Fit')) {
      baseOutline.splice(3, 0, 'Supply and demand dynamics');
    }
    
    setOutline(baseOutline.join('\n'));
    
    const sampleFaqs = [
      `Q: What is ${primaryKeyword}?\nA: [Answer here]`,
      `Q: How do I develop ${primaryKeyword}?\nA: [Answer here]`,
      `Q: Can ${primaryKeyword} change over time?\nA: [Answer here]`
    ];
    setFaqs(sampleFaqs.join('\n\n'));
    
    toast({
      title: 'Outline generated',
      description: 'Review and customize the generated brief'
    });
  };

  const handleSave = () => {
    if (!primaryKeyword || !metaTitle || !promiseOneLine) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in primary keyword, meta title, and promise',
        variant: 'destructive'
      });
      return;
    }

    const parsedOutline = outline.split('\n').filter(l => l.trim());
    const parsedFaqs = faqs.split('\n\n').map(block => {
      const [q, a] = block.split('\nA:');
      return {
        question: q.replace('Q:', '').trim(),
        answer: a?.trim() || ''
      };
    });

    addBrief({
      slug: generatedSlug,
      meta: {
        title: metaTitle,
        description: metaDescription,
        slug: generatedSlug
      },
      promiseOneLine,
      outline: parsedOutline,
      faq: parsedFaqs,
      schema,
      internalLinks: {
        pillar: '',
        siblings: [],
        glossary: '',
        cta: CTA_COPY.primary[0]
      },
      images: {
        hero: '',
        diagrams: []
      },
      reviewers: {
        seo: false,
        sme: false,
        brand: false
      },
      updateCadence: 'Quarterly',
      keywordIntent: {
        id: crypto.randomUUID(),
        primary: primaryKeyword,
        variants: variants.split(',').map(v => v.trim()),
        intent: pageType,
        persona,
        concepts,
        cluster
      }
    });

    toast({
      title: 'Brief saved',
      description: 'Content brief added to library'
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Brief Inputs</CardTitle>
            <CardDescription>Define the target keyword and audience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-keyword">Primary Keyword *</Label>
              <Input
                id="primary-keyword"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                placeholder="e.g., cognitive function development"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variants">Keyword Variants (comma-separated)</Label>
              <Input
                id="variants"
                value={variants}
                onChange={(e) => setVariants(e.target.value)}
                placeholder="e.g., develop cognitive skills, improve functions"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Page Type</Label>
                <Select value={pageType} onValueChange={(v) => setPageType(v as PageType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Informational">Informational</SelectItem>
                    <SelectItem value="POV">POV</SelectItem>
                    <SelectItem value="How-to">How-to</SelectItem>
                    <SelectItem value="Comparison">Comparison</SelectItem>
                    <SelectItem value="Case">Case Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Persona</Label>
                <Select value={persona} onValueChange={(v) => setPersona(v as Persona)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Org leader">Org Leader</SelectItem>
                    <SelectItem value="Coach">Coach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>PRISM Concepts (select up to 2)</Label>
              <div className="flex flex-wrap gap-2">
                {(['Dimensionality', 'Regulation/N_z', 'Relational Fit'] as PrismConcept[]).map(concept => (
                  <Badge
                    key={concept}
                    variant={concepts.includes(concept) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleConcept(concept)}
                  >
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cluster Type</Label>
                <Select value={cluster} onValueChange={(v) => setCluster(v as ClusterType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pillar">Pillar</SelectItem>
                    <SelectItem value="Hub">Hub</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Glossary">Glossary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Schema Type</Label>
                <Select value={schema} onValueChange={(v) => setSchema(v as SchemaType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="HowTo">HowTo</SelectItem>
                    <SelectItem value="FAQPage">FAQPage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateOutline} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Generate Outline
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generated Brief</CardTitle>
            <CardDescription>Review and customize the content structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta Title ({metaTitle.length}/60)</Label>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description ({metaDescription.length}/155)</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={155}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={generatedSlug}
                onChange={(e) => setGeneratedSlug(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="promise">Promise in One Line</Label>
              <Textarea
                id="promise"
                value={promiseOneLine}
                onChange={(e) => setPromiseOneLine(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outline">Outline (one heading per line)</Label>
              <Textarea
                id="outline"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faqs">FAQs (Q: / A: format, double-line break between)</Label>
              <Textarea
                id="faqs"
                value={faqs}
                onChange={(e) => setFaqs(e.target.value)}
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Brief
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
