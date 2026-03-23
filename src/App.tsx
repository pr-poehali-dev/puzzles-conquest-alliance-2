import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import MembersPage from "./pages/MembersPage";
import RulesPage from "./pages/RulesPage";
import EventsPage from "./pages/EventsPage";
import JoinPage from "./pages/JoinPage";
import LeaderPanel from "./pages/LeaderPanel";
import AuthModal from "./components/AuthModal";
import Navigation from "./components/Navigation";
import { AppState, User } from "./types";

const initialState: AppState = {
  currentUser: null,
  members: [
    { id: "1", nickname: "ВождьТёмный", rank: "leader", avatar: null, joinedAt: "2024-01-01", online: true },
    { id: "2", nickname: "ЖелезныйКулак", rank: "officer", avatar: null, joinedAt: "2024-02-15", online: true },
    { id: "3", nickname: "СтальнойВоин", rank: "veteran", avatar: null, joinedAt: "2024-03-10", online: false },
    { id: "4", nickname: "ТёмныйЛучник", rank: "warrior", avatar: null, joinedAt: "2024-04-20", online: true },
    { id: "5", nickname: "ОгненныйМаг", rank: "recruit", avatar: null, joinedAt: "2024-05-01", online: false },
  ],
  messages: [
    { id: "m1", userId: "1", nickname: "ВождьТёмный", text: "Братья! Альянс ОРДА приветствует всех воинов!", timestamp: Date.now() - 3600000, type: "text", rank: "leader" },
    { id: "m2", userId: "2", nickname: "ЖелезныйКулак", text: "Готовимся к великой битве! Все на позиции!", timestamp: Date.now() - 1800000, type: "text", rank: "officer" },
    { id: "m3", userId: "4", nickname: "ТёмныйЛучник", text: "Орда непобедима! 🔥", timestamp: Date.now() - 600000, type: "text", rank: "warrior" },
  ],
  rules: [
    "Уважать всех участников альянса",
    "Участвовать в альянсовых войнах обязательно",
    "Донатить в альянсовый сундук минимум 500 в неделю",
    "Не вступать в союзы с врагами ОРДЫ",
    "Активность — не менее 3 дней в неделю",
  ],
  events: [
    { id: "e1", title: "Война альянсов", description: "Великое сражение против альянса Стальные Клинки", date: "2026-03-28", type: "war" },
    { id: "e2", title: "Турнир героев", description: "Внутренний турнир — призы победителям", date: "2026-04-05", type: "tournament" },
    { id: "e3", title: "Сбор ресурсов", description: "Общий сбор ресурсов для усиления замка", date: "2026-04-10", type: "gather" },
  ],
  page: "home",
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("horde_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed, page: "home" };
      } catch { return initialState; }
    }
    return initialState;
  });
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const { page, ...toSave } = state;
    localStorage.setItem("horde_state", JSON.stringify(toSave));
  }, [state]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#join") {
      setState(s => ({ ...s, page: "join" }));
    }
  }, []);

  const navigate = (page: AppState["page"]) => {
    if ((page === "chat" || page === "members" || page === "leader") && !state.currentUser) {
      setShowAuth(true);
      return;
    }
    setState(s => ({ ...s, page }));
  };

  const handleRegister = (user: User) => {
    setState(s => ({
      ...s,
      currentUser: user,
      members: s.members.find(m => m.id === user.id)
        ? s.members.map(m => m.id === user.id ? user : m)
        : [...s.members, user],
    }));
    setShowAuth(false);
  };

  const handleLogout = () => {
    setState(s => ({ ...s, currentUser: null, page: "home" }));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <Navigation
        page={state.page}
        navigate={navigate}
        currentUser={state.currentUser}
        onLogout={handleLogout}
        onLogin={() => setShowAuth(true)}
      />

      <main>
        {state.page === "home" && (
          <HomePage navigate={navigate} members={state.members} events={state.events} />
        )}
        {state.page === "chat" && state.currentUser && (
          <ChatPage
            currentUser={state.currentUser}
            messages={state.messages}
            members={state.members}
            onSendMessage={(msg) => setState(s => ({ ...s, messages: [...s.messages, msg] }))}
            onDeleteMessage={(id) => setState(s => ({ ...s, messages: s.messages.filter(m => m.id !== id) }))}
          />
        )}
        {state.page === "members" && state.currentUser && (
          <MembersPage
            members={state.members}
            currentUser={state.currentUser}
          />
        )}
        {state.page === "rules" && (
          <RulesPage rules={state.rules} currentUser={state.currentUser} />
        )}
        {state.page === "events" && (
          <EventsPage events={state.events} currentUser={state.currentUser} />
        )}
        {state.page === "join" && (
          <JoinPage
            onJoin={(user) => {
              handleRegister(user);
              setState(s => ({ ...s, page: "home" }));
            }}
          />
        )}
        {state.page === "leader" && state.currentUser?.rank === "leader" && (
          <LeaderPanel
            state={state}
            onUpdateState={(updates) => setState(s => ({ ...s, ...updates }))}
          />
        )}
        {state.page === "leader" && state.currentUser && state.currentUser.rank !== "leader" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="horde-card p-8 text-center rounded-lg">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="font-cinzel text-2xl text-gold-bright mb-2">Доступ запрещён</h2>
              <p className="text-muted-foreground">Только глава альянса может войти в эту панель</p>
            </div>
          </div>
        )}
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onRegister={handleRegister}
          existingMembers={state.members}
        />
      )}
    </div>
  );
}
