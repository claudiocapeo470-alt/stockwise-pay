import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutDashboard, Users, CreditCard, Globe, Palette, Mail, BarChart3, Settings, ChevronLeft, ChevronRight, Crown, LogOut } from 'lucide-react';
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Déconnexion réussie');
    navigate('/ceo', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {!collapsed && <img src={logo} alt="Stocknix" className="h-7" />}
          <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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

        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.url}
              to={item.url}
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
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/40 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-white font-semibold text-lg">{PAGE_TITLES[location.pathname] || 'CEO Panel'}</h1>
          <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            CEO Panel
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
