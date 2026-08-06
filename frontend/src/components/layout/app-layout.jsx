import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Sprout,
  HeartPulse,
  BookOpen,
  MessageSquare,
  Shield,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
function AppLayout({ children }) {
  const { user, logout, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("village_theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    document.documentElement.classList.toggle("dark", nextMode);
    localStorage.setItem("village_theme", nextMode ? "dark" : "light");
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>;
  }
  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Jobs", url: "/jobs", icon: Briefcase },
    { title: "Applications", url: "/applications", icon: FileText },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Agriculture", url: "/agriculture", icon: Sprout },
    { title: "Healthcare", url: "/healthcare", icon: HeartPulse },
    { title: "Education", url: "/education", icon: BookOpen },
    { title: "My Grievances", url: "/grievances", icon: MessageSquare }
  ];
  if (user.role === "admin" || user.role === "provider") {
    navItems.push({ title: "Recruitment Panel", url: "/admin", icon: Shield });
  }
  return <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/favicon.svg" alt="VillageConnect Logo" className="size-8 rounded-md shadow-sm" />
              <span className="text-xl font-bold text-foreground">VillageConnect</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Services</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={location.startsWith(item.url)}>
                        <Link href={item.url} className="flex items-center gap-2 text-base py-6">
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <Badge variant="secondary" className="w-fit text-[10px] uppercase">{user.role}</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
              <LogOut className="size-4" />
              Log out
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/90 px-4 backdrop-blur md:px-8">
            <div className="flex items-center gap-2 md:gap-3">
              <SidebarTrigger />
              <div>
                <p className="text-sm text-muted-foreground">Workspace</p>
                <p className="font-semibold leading-tight">VillageConnect</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
                {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <div className="hidden sm:flex items-center gap-2 rounded-md border px-3 py-1.5">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{user.role}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>;
}
export {
  AppLayout
};
