import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const scripts = [
  {
    title: "When we're both stressed",
    script: "I'm noticing Stressed×Stressed. Can we pause for 10 and pick a calmer window? I care about this and want us at our best."
  },
  {
    title: "When a lane feels red",
    script: "I'm asking for {Lane} support. What would 'green' look like for you, and what's easy for me to supply?"
  },
  {
    title: "When drift bites us at work",
    script: "I'm in Performative mode and leaning {TypeResemblance}. What do you need from me to feel covered on {Lane}?"
  }
];

export default function ConversationScripts() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Conversation Scripts</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {scripts.map((script, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{script.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic text-muted-foreground">
                "{script.script}"
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}