import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-48"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>PRISM Types</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {prismTypes.map((type) => (
                <SidebarMenuItem key={type.acronym}>
                  <SidebarMenuButton asChild>
                    <NavLink to={type.path} className={getNavCls}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 prism-gradient-hero rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">
                            {type.acronym}
                          </span>
                        </div>
                        {!isCollapsed && (
                          <span className="text-sm truncate">{type.name}</span>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}