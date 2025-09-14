import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

export default function RolePlayAccordion() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Role-Play Scenarios</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="decision">
          <AccordionTrigger>The 4:45pm Decision</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <p className="text-sm">
              You're both tired. A decision needs to be made but capacity is low. 
              Which lane is really being asked for?
            </p>
            <div>
              <label className="text-sm font-medium">Pick a micro-ritual:</label>
              <Textarea 
                placeholder="e.g., 'Let's sleep on it and decide at 9am when we're fresh...'"
                className="mt-1"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="logistics">
          <AccordionTrigger>Weekend Logistics</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <p className="text-sm">
              One wants plans; one wants spontaneity. Structure vs. Timing lanes clash.
            </p>
            <div>
              <label className="text-sm font-medium">Name the lanes, then trade one task:</label>
              <Textarea 
                placeholder="e.g., 'You handle morning logistics, I'll handle evening flexibility...'"
                className="mt-1"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="values">
          <AccordionTrigger>Values Clash</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <p className="text-sm">
              A fast decision overrides a boundary. Care lane needs repair.
            </p>
            <div>
              <label className="text-sm font-medium">Use a pause word; write one sentence you'd say:</label>
              <Textarea 
                placeholder="e.g., 'Hold on - that crossed my boundary around X. Can we back up?'"
                className="mt-1"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}