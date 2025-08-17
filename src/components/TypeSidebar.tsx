import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const prismTypes = [
  { acronym: "ILE", name: "Idea Catalyst", path: "/types/idea-catalyst" },
  { acronym: "LII", name: "Framework Architect", path: "/types/framework-architect" },
  { acronym: "SEI", name: "Comfort Harmonizer", path: "/types/comfort-harmonizer" },
  { acronym: "ESE", name: "Atmosphere Host", path: "/types/atmosphere-host" },
  { acronym: "SLE", name: "Tactical Commander", path: "/types/tactical-commander" },
  { acronym: "LSI", name: "Systems Marshal", path: "/types/systems-marshal" },
  { acronym: "IEI", name: "Vision Muse", path: "/types/vision-muse" },
  { acronym: "EIE", name: "Inspiration Orchestrator", path: "/types/inspiration-orchestrator" },
  { acronym: "LIE", name: "Strategic Executor", path: "/types/strategic-executor" },
  { acronym: "ILI", name: "Foresight Analyst", path: "/types/foresight-analyst" },
  { acronym: "SEE", name: "Relational Driver", path: "/types/relational-driver" },
  { acronym: "ESI", name: "Boundary Guardian", path: "/types/boundary-guardian" },
  { acronym: "LSE", name: "Operations Steward", path: "/types/operations-steward" },
  { acronym: "SLI", name: "Practical Optimizer", path: "/types/practical-optimizer" },
  { acronym: "IEE", name: "Possibility Connector", path: "/types/possibility-connector" },
  { acronym: "EII", name: "Integrity Guide", path: "/types/integrity-guide" },
];

export function TypeSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isHovered, setIsHovered] = useState(false);

  const isActive = (path: string) => currentPath === path;

  return (
    <div 
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden xl:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg 
        transition-all duration-300 ease-in-out
        ${isHovered ? 'w-52 p-4' : 'w-16 p-2'}
      `}>
        <div className="flex flex-col gap-2">
          {prismTypes.map((type) => {
            const active = isActive(type.path);
            return (
              <NavLink
                key={type.acronym}
                to={type.path}
                className={`
                  flex items-center gap-3 p-2 rounded-md transition-all duration-200
                  ${active 
                    ? 'bg-accent text-accent-foreground font-medium shadow-sm' 
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <div className="w-8 h-8 prism-gradient-hero rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {type.acronym}
                  </span>
                </div>
                <span className={`
                  text-sm font-medium transition-all duration-300
                  ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                  ${active ? 'text-accent-foreground' : ''}
                `}>
                  {type.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}