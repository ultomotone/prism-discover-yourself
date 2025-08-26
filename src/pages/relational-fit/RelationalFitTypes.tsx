import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { types } from "@/data/relationalFit";

const RelationalFitTypes = () => {
  const getQuadraColor = (quadra: string) => {
    switch (quadra) {
      case "Alpha": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Beta": return "bg-green-100 text-green-800 border-green-200";
      case "Gamma": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Delta": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getClubColor = (club: string) => {
    switch (club) {
      case "NT": return "text-rf-navy";
      case "NF": return "text-rf-teal";
      case "SF": return "text-rf-gold-foreground";
      case "ST": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/relational-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <h1 className="text-4xl font-bold mb-4">PRISM Types</h1>
          <p className="text-muted-foreground mb-6">
            Explore all 16 personality types in the PRISM model. Each type has unique strengths and relationship patterns.
          </p>
        </div>

        {/* Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {types.map((type) => (
            <Card key={type.code} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {type.code}
                  </Badge>
                  <Badge variant="secondary" className={`text-xs ${getQuadraColor(type.quadra)}`}>
                    {type.quadra}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{type.title}</CardTitle>
                <CardDescription>
                  <span className={`font-medium ${getClubColor(type.club)}`}>
                    {type.functions}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {type.one}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {type.att === "E" ? "Extraverted" : "Introverted"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {type.rat === "J" ? "Judging" : "Perceiving"}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getClubColor(type.club)}`}>
                    {type.club}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground mb-3">
                  <div>Lead: <span className="font-medium">{type.lead}</span></div>
                  <div>Creative: <span className="font-medium">{type.crea}</span></div>
                </div>

                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to={`/relational-fit/heatmap`}>
                    View Compatibility <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to explore compatibility?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-rf-teal hover:bg-rf-teal/90 text-rf-teal-foreground">
              <Link to="/relational-fit/heatmap">
                View Full Heatmap <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationalFitTypes;