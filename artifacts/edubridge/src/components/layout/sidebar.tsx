import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  CreditCard,
  Menu,
  GraduationCap,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { motion } from "framer-motion";

export function Sidebar() {
  const { t, lang } = useLanguage();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/feed", label: t("feed"), icon: MessageSquare },
    { href: "/courses", label: t("courses"), icon: BookOpen },
    { href: "/algorithms", label: t("algorithms"), icon: Cpu },
    { href: "/teachers", label: t("teachers"), icon: Users },
    { href: "/messages", label: t("messages"), icon: MessageSquare },
    { href: "/my-courses", label: t("myCourses"), icon: GraduationCap, hidden: !["teacher", "student"].includes(user?.role || "") },
    { href: "/payments", label: t("payments"), icon: CreditCard, hidden: user?.role === "admin" },
    { href: "/admin", label: t("admin"), icon: Settings, hidden: user?.role !== "admin" },
  ].filter(item => !item.hidden);

  const NavLinks = () => (
    <div className="flex flex-col space-y-2 w-full">
      {navItems.map((item) => {
        const isActive = location === item.href || location.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary opacity-10 rounded-lg pointer-events-none"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Header & Sidebar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
            E
          </div>
          <span className="font-bold text-lg text-primary">EduBridge</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side={lang === "ar" ? "right" : "left"} className="w-[280px] p-0 flex flex-col">
            <div className="p-6">
               <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
                  E
                </div>
                <span className="font-bold text-xl text-primary">EduBridge</span>
              </div>
              <NavLinks />
            </div>
            <div className="mt-auto p-6 border-t border-border">
               <Link href="/profile" onClick={() => setIsOpen(false)}>
                 <div className="flex items-center gap-3 mb-4 cursor-pointer">
                    <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-sm">{lang === 'ar' ? user?.nameAr || user?.name : user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                 </div>
               </Link>
               <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
               </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-sidebar border-r border-sidebar-border z-10">
        <div className="p-6 flex flex-col h-full">
           <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm">
              E
            </div>
            <span className="font-bold text-2xl tracking-tight text-primary">EduBridge</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <NavLinks />
          </div>
          
          <div className="mt-auto pt-6">
             <Link href="/settings">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 mb-2">
                  <Settings className="w-5 h-5" />
                  <span>{t("settings")}</span>
                </div>
             </Link>
             <div className="flex items-center justify-between p-4 bg-sidebar-accent/50 rounded-xl border border-sidebar-border mt-2">
                <Link href="/profile">
                  <div className="flex items-center gap-3 cursor-pointer">
                      <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt={user?.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-background" />
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm truncate w-24">{lang === 'ar' ? user?.nameAr || user?.name : user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                      </div>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive" title={t("logout")}>
                  <LogOut className="w-4 h-4" />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
