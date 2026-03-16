import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCog,
  BarChart3,
  Warehouse,
  Wallet,
  Briefcase,
  FileText,
  Search,
  Receipt,
  FilePlus,
  Settings2,
  Building2,
  ShieldCheck,
} from "lucide-react";
import jotsLogo from "@/assets/jots-logo.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "PDV", url: "/pdv", icon: ShoppingCart },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Funcionários", url: "/funcionarios", icon: UserCog },
];

const managementNav = [
  { title: "Vendas", url: "/vendas", icon: FileText },
  { title: "Estoque", url: "/estoque", icon: Warehouse },
  { title: "Caixa", url: "/caixa", icon: Wallet },
  { title: "Malas", url: "/malas", icon: Briefcase },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const fiscalNav = [
  { title: "Notas Fiscais", url: "/notas-fiscais", icon: Receipt },
  { title: "Emitir NF", url: "/emitir-nf", icon: FilePlus },
  { title: "Config. Fiscal", url: "/configuracao-fiscal", icon: Settings2 },
  { title: "Empresas", url: "/empresas", icon: Building2 },
  { title: "Certificado", url: "/certificado-digital", icon: ShieldCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-ui">V</span>
            </div>
            <div>
              <h1 className="font-semibold text-ui tracking-tight text-sidebar-foreground">VisionFlow</h1>
              <p className="text-caption text-muted-foreground">ERP Óptico</p>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-ui">V</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Fiscal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {fiscalNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 rounded-md bg-secondary p-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-caption text-muted-foreground">Buscar...</span>
            <kbd className="ml-auto text-caption bg-background px-1.5 py-0.5 rounded-sm border text-muted-foreground">⌘K</kbd>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
