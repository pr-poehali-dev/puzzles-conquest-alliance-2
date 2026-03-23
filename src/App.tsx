import { useState, useEffect, useCallback } from "react";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import MembersPage from "./pages/MembersPage";
import RulesPage from "./pages/RulesPage";
import EventsPage from "./pages/EventsPage";
import JoinPage from "./pages/JoinPage";
import LeaderPanel from "./pages/LeaderPanel";
import AuthModal from "./components/AuthModal";
import Navigation from "./components/Navigation";
import { AppState, User, Rank } from "./types";
import {
  fetchData, apiRegister, apiSendMessage, apiDeleteMessage,
  apiSetRank, apiSetNickname, apiDeleteUser,
  apiAddRule, apiDeleteRule, apiAddEvent, apiDeleteEvent,
} from "./api";
import type { Message, AllianceEvent } from "./types";

const SAVED_USER_KEY = "horde_current_user";

const emptyState: AppState = {
  currentUser: null,
  members: [],
  messages: [],
  rules: [],
  events: [],
  page: "home",
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(SAVED_USER_KEY);
    const currentUser = saved ? JSON.parse(saved) : null;
    return { ...emptyState, currentUser };
  });
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Загрузка данных из БД
  const loadData = useCallback(async () => {
    try {
      const data = await fetchData();
      setState(s => ({
        ...s,
        members: data.members,
        messages: data.messages,
        rules: data.rules.map((r: { id: number; text: string }) => r.text),
        rulesWithIds: data.rules,
        events: data.events,
        // Обновляем текущего пользователя из БД (актуальный ранг)
        currentUser: s.currentUser
          ? (data.members.find(m => m.id === s.currentUser!.id) ?? s.currentUser)
          : null,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // polling каждые 10 сек
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#join") setState(s => ({ ...s, page: "join" }));
  }, []);

  const navigate = (page: AppState["page"]) => {
    if ((page === "chat" || page === "members" || page === "leader") && !state.currentUser) {
      setShowAuth(true);
      return;
    }
    setState(s => ({ ...s, page }));
  };

  const handleRegister = async (user: User) => {
    const result = await apiRegister(user.nickname, user.rank);
    const finalUser = result.user ?? user;
    localStorage.setItem(SAVED_USER_KEY, JSON.stringify(finalUser));
    setState(s => ({ ...s, currentUser: finalUser }));
    setShowAuth(false);
    await loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem(SAVED_USER_KEY);
    setState(s => ({ ...s, currentUser: null, page: "home" }));
  };

  const handleSendMessage = async (msg: Message) => {
    const saved = await apiSendMessage(msg);
    setState(s => ({ ...s, messages: [...s.messages, saved] }));
  };

  const handleDeleteMessage = async (id: string) => {
    await apiDeleteMessage(id);
    setState(s => ({ ...s, messages: s.messages.filter(m => m.id !== id) }));
  };

  const handleUpdateState = async (updates: Partial<AppState> & {
    _setRank?: { userId: string; rank: Rank };
    _setNickname?: { userId: string; nickname: string };
    _deleteUser?: string;
    _addRule?: string;
    _deleteRule?: number;
    _addEvent?: Omit<AllianceEvent, "id">;
    _deleteEvent?: string;
  }) => {
    if (updates._setRank) {
      await apiSetRank(updates._setRank.userId, updates._setRank.rank);
    }
    if (updates._setNickname) {
      await apiSetNickname(updates._setNickname.userId, updates._setNickname.nickname);
      if (state.currentUser?.id === updates._setNickname.userId) {
        const updated = { ...state.currentUser, nickname: updates._setNickname.nickname };
        localStorage.setItem(SAVED_USER_KEY, JSON.stringify(updated));
      }
    }
    if (updates._deleteUser) {
      await apiDeleteUser(updates._deleteUser);
    }
    if (updates._addRule !== undefined) {
      await apiAddRule(updates._addRule);
    }
    if (updates._deleteRule !== undefined) {
      await apiDeleteRule(updates._deleteRule);
    }
    if (updates._addEvent) {
      await apiAddEvent(updates._addEvent);
    }
    if (updates._deleteEvent) {
      await apiDeleteEvent(updates._deleteEvent);
    }
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark-bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">⚔️</div>
          <p className="font-cinzel text-xl shimmer-text">ОРДА</p>
          <p className="text-gray-600 font-raleway text-sm mt-2">Загрузка данных альянса...</p>
        </div>
      </div>
    );
  }

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
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
        {state.page === "members" && state.currentUser && (
          <MembersPage members={state.members} currentUser={state.currentUser} />
        )}
        {state.page === "rules" && (
          <RulesPage rules={state.rules} currentUser={state.currentUser} />
        )}
        {state.page === "events" && (
          <EventsPage events={state.events} currentUser={state.currentUser} />
        )}
        {state.page === "join" && (
          <JoinPage
            onJoin={async (user) => {
              await handleRegister(user);
              setState(s => ({ ...s, page: "home" }));
            }}
          />
        )}
        {state.page === "leader" && state.currentUser?.rank === "leader" && (
          <LeaderPanel state={state} onUpdateState={handleUpdateState} />
        )}
        {state.page === "leader" && state.currentUser && state.currentUser.rank !== "leader" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="horde-card p-8 text-center rounded-lg">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="font-cinzel text-2xl mb-2" style={{ color: 'var(--gold-bright)' }}>Доступ запрещён</h2>
              <p className="text-gray-500">Только глава альянса может войти в эту панель</p>
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
