import { useState } from "react";
import { User, AppState } from "../types";
import Icon from "@/components/ui/icon";

interface NavigationProps {
  page: AppState["page"];
  navigate: (p: AppState["page"]) => void;
  currentUser: User | null;
  onLogout: () => void;
  onLogin: () => void;
}

const navItems: { key: AppState["page"]; label: string; icon: string }[] = [
  { key: "home", label: "Главная", icon: "Home" },
  { key: "chat", label: "Чат", icon: "MessageSquare" },
  { key: "members", label: "Участники", icon: "Users" },
  { key: "rules", label: "Правила", icon: "ScrollText" },
  { key: "events", label: "События", icon: "Swords" },
  { key: "join", label: "Вступить", icon: "UserPlus" },
];

export default function Navigation({ page, navigate, currentUser, onLogout, onLogin }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b" style={{
      background: 'rgba(7, 10, 15, 0.95)',
      borderColor: 'rgba(240, 180, 41, 0.2)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(240,180,41,0.1)'
    }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate("home")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-cinzel font-black"
              style={{ background: 'linear-gradient(135deg, #8b0000, #cc0000)', boxShadow: '0 0 15px rgba(139,0,0,0.6)' }}>
              ⚔
            </div>
            <span className="font-cinzel font-black text-xl shimmer-text hidden sm:block">ОРДА</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  page === item.key
                    ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30"
                    : "text-gray-400 hover:text-yellow-300 hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon} fallback="Circle" size={15} />
                <span className="font-raleway">{item.label}</span>
              </button>
            ))}
            {currentUser?.rank === "leader" && (
              <button
                onClick={() => navigate("leader")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  page === "leader"
                    ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30"
                    : "text-yellow-600 hover:text-yellow-400 hover:bg-white/5"
                }`}
              >
                <Icon name="Crown" size={15} />
                <span className="font-raleway">Панель</span>
              </button>
            )}
          </div>

          {/* User / Auth */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-cinzel" style={{ color: 'var(--gold)' }}>{currentUser.nickname}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-md text-gray-500 hover:text-red-400 transition-colors"
                  title="Выйти"
                >
                  <Icon name="LogOut" size={16} />
                </button>
              </div>
            ) : (
              <button onClick={onLogin} className="btn-gold px-4 py-2 rounded-md text-sm">
                Войти
              </button>
            )}

            {/* Burger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-yellow-400"
            >
              <Icon name={menuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t py-3 space-y-1" style={{ borderColor: 'rgba(240,180,41,0.15)' }}>
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { navigate(item.key); setMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-md text-sm transition-all ${
                  page === item.key
                    ? "text-yellow-400 bg-yellow-400/10"
                    : "text-gray-400 hover:text-yellow-300"
                }`}
              >
                <Icon name={item.icon} fallback="Circle" size={16} />
                <span className="font-raleway">{item.label}</span>
              </button>
            ))}
            {currentUser?.rank === "leader" && (
              <button
                onClick={() => { navigate("leader"); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-md text-sm text-yellow-600 hover:text-yellow-400"
              >
                <Icon name="Crown" size={16} />
                <span className="font-raleway">Панель главы</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}