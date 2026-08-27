import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { LayoutDashboard, LogOut, PanelLeft, Plus, WandSparkles } from "lucide-react";
import { CSSProperties, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const SIDEBAR_WIDTH_KEY = "landmake-sidebar-width";
const menuItems = [{ icon: LayoutDashboard, label: "Workspace", path: "/app" }];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || 272);
  const { loading, user } = useAuth();
  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()), [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="grid min-h-screen place-items-center bg-[#f8f7ff] px-5 font-[Manrope,sans-serif]"><div className="w-full max-w-md rounded-[30px] border border-violet-100 bg-white p-8 text-center shadow-[0_24px_80px_rgba(76,29,149,0.12)]"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-600 text-white"><WandSparkles className="h-6 w-6" /></span><h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-slate-950">LandMake</h1><p className="mt-3 text-sm leading-6 text-slate-500">A rule-based prompt-to-template generator for landing pages. Sign in to create, preview, save, and export your pages.</p><Button onClick={() => startLogin()} size="lg" className="mt-7 h-11 w-full rounded-xl bg-violet-600 font-semibold text-white hover:bg-violet-700">Sign in to continue</Button></div></div>;
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const activeMenuItem = menuItems.find(item => location.startsWith(item.path));
  useEffect(() => {
    const move = (event: MouseEvent) => { const width = event.clientX; if (width >= 220 && width <= 380) setSidebarWidth(width); };
    const up = () => document.body.classList.remove("cursor-col-resize");
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
  }, [setSidebarWidth]);
  return <><Sidebar collapsible="icon" className="border-r border-violet-100 bg-white"><SidebarHeader className="h-[76px] justify-center border-b border-violet-50 px-3"><div className="flex w-full items-center gap-3"><button onClick={toggleSidebar} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-violet-50 hover:text-violet-700" aria-label="Toggle navigation"><PanelLeft className="h-4 w-4" /></button>{!isCollapsed && <button onClick={() => setLocation("/app")} className="flex min-w-0 items-center gap-2.5 text-left"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white"><WandSparkles className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-bold tracking-[-0.03em] text-slate-950">LandMake</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-600">Template studio</span></span></button>}</div></SidebarHeader><SidebarContent className="gap-0 px-2 py-4"><SidebarMenu>{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location.startsWith(item.path)} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-10 rounded-xl font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-800 data-[active=true]:bg-violet-600 data-[active=true]:text-white"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu><div className="mt-6 px-2 group-data-[collapsible=icon]:hidden"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Create</p><button onClick={() => setLocation("/app?new=1")} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-800"><Plus className="h-3.5 w-3.5" />New landing page</button></div></SidebarContent><SidebarFooter className="border-t border-violet-50 p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-1 text-left hover:bg-violet-50"><Avatar className="h-9 w-9 shrink-0 border border-violet-100"><AvatarFallback className="bg-violet-50 text-xs font-bold text-violet-700">{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold text-slate-800">{user?.name || "Creator"}</p><p className="mt-0.5 truncate text-xs text-slate-500">{user?.email || "Signed in"}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-600"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><SidebarInset className="bg-[#faf9ff]"><main className="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">{children}</main></SidebarInset></>;
}
