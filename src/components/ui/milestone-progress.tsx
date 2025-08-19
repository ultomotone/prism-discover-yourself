import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface MilestoneProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  max?: number;
  milestones?: number[];
}

const MilestoneProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  MilestoneProgressProps
>(({ className, value = 0, max = 1000, milestones = [100, 500], ...props }, ref) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
      
      {/* Milestone markers */}
      {milestones.map((milestone) => {
        const milestonePercentage = (milestone / max) * 100;
        const isPassed = value >= milestone;
        
        return (
          <div
            key={milestone}
            className="absolute top-0 h-4 w-1 flex items-center justify-center"
            style={{ left: `${milestonePercentage}%` }}
          >
            {/* Marker line */}
            <div 
              className={cn(
                "w-0.5 h-full rounded-full",
                isPassed ? "bg-primary-foreground" : "bg-muted-foreground/60"
              )}
            />
            {/* Rivet/dot */}
            <div 
              className={cn(
                "absolute w-2 h-2 rounded-full border-2 border-background shadow-sm",
                isPassed ? "bg-primary" : "bg-muted-foreground/60"
              )}
            />
            {/* Label */}
            <div 
              className={cn(
                "absolute -top-6 text-xs font-medium whitespace-nowrap transform -translate-x-1/2",
                isPassed ? "text-primary" : "text-muted-foreground"
              )}
            >
              {milestone}
            </div>
          </div>
        );
      })}
    </div>
  )
})

MilestoneProgress.displayName = "MilestoneProgress"

export { MilestoneProgress }