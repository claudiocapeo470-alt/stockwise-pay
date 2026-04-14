import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutDashboard, Users, CreditCard, Globe, Palette, Mail, BarChart3, Settings, ChevronLeft, ChevronRight, Crown, LogOut, Menu, X } from 'lucide-react';
import logo from '@/assets/stocknix-logo-official.png';

const NAV_ITEMS = [
  { label: "Vue d'ensemble", url: '/ceo/dashboard', icon: LayoutDashboard },
  { label: 'Utilisateurs', url: '/ceo/users', icon: Users },
  { label: 'Abonnements', url: '/ceo/subscriptions', icon: CreditCard },
  { label: 'Landing Page', url: '/ceo/landing', icon: Globe },
  { label: 'Apparence', url: '/ceo/appearance', icon: Palette },
  { label: 'Emails & Notifs', url: '/ceo/notifications', icon: Mail },
  { label: 'Analytics', url: '/ceo/analytics', icon: BarChart3 },
  { label: 'Paramètres', url: '/ceo/settings', icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  '/ceo/dashboard': "Vue d'ensemble",
  '/ceo/users': 'Utilisateurs',
  '/ceo/subscriptions': 'Abonnements',
  '/ceo/landing': 'Landing Page',
  '/ceo/appearance': 'Apparence',
  '/ceo/notifications': 'Emails & Notifications',
  '/ceo/analytics': 'Analytics',
  '/ceo/settings': 'Paramètres',
};

export function CeoLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Déconnexion réussie');
    navigate('/ceo', { replace: true });
  };

  const sidebarContent = (
    <>
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        {!collapsed && <img src={logo} alt="Stocknix" className="h-7" />}
        <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 hidden lg:block">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-teal-400" />
            <span className="text-xs font-semibold text-teal-400">Super Admin</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">support@stocknix.com</p>
        </div>
      )}

      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.url}
            to={item.url}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-800">
        <button onClick={handleLogout} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full transition-all ${collapsed ? 'justify-center' : ''}`} title="Déconnexion">
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
      )}

      {/* Sidebar - responsive */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800
        transition-transform duration-300 flex flex-col
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 bg-slate-900/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-white font-semibold text-base lg:text-lg">{PAGE_TITLES[location.pathname] || 'CEO Panel'}</h1>
          </div>
          <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            CEO
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
