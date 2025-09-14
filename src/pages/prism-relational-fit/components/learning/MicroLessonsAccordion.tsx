import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MicroLessonsAccordion() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Micro-Lessons</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="supply-demand">
          <AccordionTrigger>Supply↔Demand in Plain English</AccordionTrigger>
          <AccordionContent>
            <em>Great relationships run on exchange.</em> Supply = what you can offer on repeat without resentment. 
            Demand = what you reliably want more of. Green lanes mean your exchange is healthy.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="regulation">
          <AccordionTrigger>Regulation = Capacity</AccordionTrigger>
          <AccordionContent>
            Calm expands generosity and patience. Stress shrinks both. Protect sleep, pacing, and recovery first—then talk.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="core-alignment">
          <AccordionTrigger>Core Alignment is a Start, Not a Sentence</AccordionTrigger>
          <AccordionContent>
            Complementary styles start smoother, but daily habits move the needle more than labels.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="drift">
          <AccordionTrigger>Drift Happens</AccordionTrigger>
          <AccordionContent>
            Contexts nudge us into temporary orientations that resemble other types. Notice when you're in Flow vs. Performative vs. Stress.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}