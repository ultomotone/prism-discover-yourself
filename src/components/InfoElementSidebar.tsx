import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const infoElements = [
  { code: "Ti", name: "Internal Logic", path: "/ti" },
  { code: "Te", name: "Effectiveness", path: "/te" },
  { code: "Fi", name: "Personal Values", path: "/fi" },
  { code: "Fe", name: "Shared Emotion", path: "/fe" },
  { code: "Ni", name: "Patterns Over Time", path: "/ni" },
  { code: "Ne", name: "Possibilities", path: "/ne" },
  { code: "Si", name: "Steadiness & Comfort", path: "/si" },
  { code: "Se", name: "Decisive Action", path: "/se" },
];

export function InfoElementSidebar() {
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
        ${isHovered ? 'w-60 p-4' : 'w-16 p-2'}
      `}>
        <div className="flex flex-col gap-2">
          {infoElements.map((element) => {
            const active = isActive(element.path);
            return (
              <NavLink
                key={element.code}
                to={element.path}
                className={`
                  flex items-center gap-3 p-2 rounded-md transition-all duration-200
                  ${active 
                    ? 'bg-accent text-accent-foreground font-medium shadow-sm' 
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <div className="w-8 h-8 prism-gradient-secondary rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {element.code}
                  </span>
                </div>
                <span className={`
                  text-sm font-medium transition-all duration-300
                  ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                  ${active ? 'text-accent-foreground' : ''}
                `}>
                  {element.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}