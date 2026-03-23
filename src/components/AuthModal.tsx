import { useState } from "react";
import { User, RANK_LABELS } from "../types";
import Icon from "@/components/ui/icon";

interface AuthModalProps {
  onClose: () => void;
  onRegister: (user: User) => void;
  existingMembers: User[];
}

export default function AuthModal({ onClose, onRegister, existingMembers }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nickname, setNickname] = useState("");
  const [leaderPassword, setLeaderPassword] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [error, setError] = useState("");

  const LEADER_PASSWORD = "horde2024";

  const handleSubmit = () => {
    if (!nickname.trim()) {
      setError("Введи свой игровой ник");
      return;
    }

    const existing = existingMembers.find(m => m.nickname.toLowerCase() === nickname.trim().toLowerCase());

    if (mode === "login") {
      if (!existing) {
        setError("Игрок с таким ником не найден. Сначала зарегистрируйся или вступи в альянс.");
        return;
      }
      if (isLeader && leaderPassword !== LEADER_PASSWORD) {
        setError("Неверный пароль главы");
        return;
      }
      onRegister(existing);
    } else {
      if (existing) {
        setError("Этот ник уже занят. Введи другой или войди.");
        return;
      }
      const newUser: User = {
        id: Date.now().toString(),
        nickname: nickname.trim(),
        rank: isLeader && leaderPassword === LEADER_PASSWORD ? "leader" : "recruit",
        avatar: null,
        joinedAt: new Date().toISOString().split("T")[0],
        online: true,
      };
      onRegister(newUser);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="horde-card rounded-xl p-8 w-full max-w-md animate-scale-in relative"
        style={{ boxShadow: '0 0 60px rgba(139,0,0,0.4), 0 0 120px rgba(0,0,0,0.8)' }}>
        
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-yellow-400 transition-colors">
          <Icon name="X" size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚔️</div>
          <h2 className="font-cinzel text-2xl font-bold gold-glow" style={{ color: 'var(--gold-bright)' }}>
            ОРДА
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-raleway">Альянс Puzzles Conquest</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg overflow-hidden mb-6 border" style={{ borderColor: 'rgba(240,180,41,0.2)' }}>
          {(["login", "register"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-cinzel font-medium transition-all ${
                mode === m
                  ? "text-black"
                  : "text-gray-400 hover:text-yellow-300"
              }`}
              style={mode === m ? { background: 'linear-gradient(135deg, #b8860b, #ffd700)' } : {}}
            >
              {m === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-cinzel text-gray-400 mb-1.5">Игровой ник</label>
            <input
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError(""); }}
              placeholder="Введи свой ник из игры"
              className="w-full px-4 py-3 rounded-lg text-sm font-raleway outline-none transition-all"
              style={{
                background: 'rgba(13,17,23,0.8)',
                border: '1px solid rgba(240,180,41,0.2)',
                color: '#f0e6c0',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(240,180,41,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(240,180,41,0.2)'}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Leader toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isLeader}
              onChange={e => setIsLeader(e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm font-raleway text-gray-400">Я глава альянса</span>
            <span className="text-yellow-500 text-sm">👑</span>
          </label>

          {isLeader && (
            <div>
              <label className="block text-xs font-cinzel text-gray-400 mb-1.5">Пароль главы</label>
              <input
                type="password"
                value={leaderPassword}
                onChange={e => setLeaderPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-sm font-raleway outline-none"
                style={{
                  background: 'rgba(13,17,23,0.8)',
                  border: '1px solid rgba(240,180,41,0.2)',
                  color: '#f0e6c0',
                }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>
          )}

          {error && (
            <div className="text-red-400 text-xs font-raleway bg-red-900/20 px-3 py-2 rounded-md border border-red-800/40">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="btn-gold w-full py-3 rounded-lg text-base"
          >
            {mode === "login" ? "Войти в альянс" : "Вступить в ОРДУ"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4 font-raleway">
          Данные сохраняются автоматически
        </p>
      </div>
    </div>
  );
}
