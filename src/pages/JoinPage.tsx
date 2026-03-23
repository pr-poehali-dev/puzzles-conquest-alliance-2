import { useState, useEffect, useRef } from "react";
import { User } from "../types";
import Icon from "@/components/ui/icon";

interface JoinPageProps {
  onJoin: (user: User) => void;
}

export default function JoinPage({ onJoin }: JoinPageProps) {
  const [step, setStep] = useState<"welcome" | "form" | "success">("welcome");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [declined, setDeclined] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playWelcomeSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        const t = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch (e) { console.warn("Audio unavailable", e); }
  };

  const handleAccept = () => {
    setStep("form");
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  const handleJoin = () => {
    if (!nickname.trim()) {
      setError("Введи свой игровой ник");
      return;
    }
    if (nickname.trim().length < 2) {
      setError("Ник должен быть не менее 2 символов");
      return;
    }

    playWelcomeSound();
    setStep("success");

    setTimeout(() => {
      const newUser: User = {
        id: Date.now().toString(),
        nickname: nickname.trim(),
        rank: "recruit",
        avatar: null,
        joinedAt: new Date().toISOString().split("T")[0],
        online: true,
      };
      onJoin(newUser);
    }, 3000);
  };

  if (declined) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="horde-card rounded-xl p-10 text-center max-w-md animate-scale-in">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="font-cinzel text-2xl font-bold mb-2" style={{ color: 'var(--gold)' }}>
            Жаль...
          </h2>
          <p className="text-gray-400 font-raleway text-sm">
            Двери ОРДЫ всегда открыты. Возвращайся, когда будешь готов.
          </p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="horde-card rounded-xl p-10 text-center max-w-md animate-scale-in"
          style={{ boxShadow: '0 0 60px rgba(240,180,41,0.3)' }}>
          <div className="text-6xl mb-6 animate-bounce">⚔️</div>
          <h2 className="font-cinzel text-3xl font-black mb-3 shimmer-text">
            Добро пожаловать!
          </h2>
          <p className="text-gray-300 font-raleway text-lg mb-2">
            Воин <span style={{ color: 'var(--gold-bright)' }} className="font-semibold">{nickname}</span>
          </p>
          <p className="text-gray-400 font-raleway text-sm">
            Ты принят в ряды ОРДЫ! Братья встречают тебя с честью.
          </p>
          <div className="mt-6 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="horde-card rounded-xl p-10 max-w-md w-full animate-fade-in">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">⚔️</div>
            <h2 className="font-cinzel text-2xl font-bold" style={{ color: 'var(--gold-bright)' }}>
              Твой игровой ник
            </h2>
            <p className="text-gray-400 text-sm font-raleway mt-1">Именно тот, что используешь в Puzzles Conquest</p>
          </div>

          <div className="space-y-4">
            <input
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError(""); }}
              placeholder="Введи свой ник..."
              autoFocus
              className="w-full px-4 py-3.5 rounded-lg text-base font-raleway outline-none transition-all"
              style={{
                background: 'rgba(13,17,23,0.8)',
                border: '1px solid rgba(240,180,41,0.3)',
                color: '#f0e6c0',
              }}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
            />
            {error && (
              <div className="text-red-400 text-xs font-raleway">{error}</div>
            )}
            <button onClick={handleJoin} className="btn-gold w-full py-3.5 rounded-lg text-base">
              Вступить в ОРДУ ⚔️
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="horde-card rounded-xl p-10 text-center max-w-lg w-full animate-scale-in"
        style={{ boxShadow: '0 0 80px rgba(139,0,0,0.3)' }}>

        {/* Banner glow */}
        <div className="relative mb-6">
          <div className="text-7xl mb-2" style={{ filter: 'drop-shadow(0 0 20px rgba(240,180,41,0.8))' }}>⚔️</div>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center top, rgba(240,180,41,0.15), transparent 60%)' }} />
        </div>

        <h2 className="font-cinzel text-4xl font-black mb-1 shimmer-text">ОРДА</h2>
        <p className="font-cinzel text-sm tracking-widest mb-4" style={{ color: 'rgba(240,180,41,0.5)' }}>
          АЛЬЯНС · PUZZLES CONQUEST
        </p>

        <div className="ornament-line my-5" />

        <p className="text-gray-300 font-raleway text-lg mb-2">
          Тебя приглашают вступить в легендарный альянс
        </p>
        <p className="text-gray-500 font-raleway text-sm mb-8">
          Присоединяйся к братству воинов. Вместе мы непобедимы.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8 p-4 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="text-center">
            <div className="font-cinzel text-2xl font-bold" style={{ color: 'var(--gold-bright)' }}>⚔️</div>
            <div className="text-xs text-gray-500 font-raleway mt-1">Войны</div>
          </div>
          <div className="text-center">
            <div className="font-cinzel text-2xl font-bold" style={{ color: 'var(--gold-bright)' }}>🏆</div>
            <div className="text-xs text-gray-500 font-raleway mt-1">Победы</div>
          </div>
          <div className="text-center">
            <div className="font-cinzel text-2xl font-bold" style={{ color: 'var(--gold-bright)' }}>🛡️</div>
            <div className="text-xs text-gray-500 font-raleway mt-1">Защита</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="btn-gold flex-1 py-4 rounded-lg text-base flex items-center justify-center gap-2"
          >
            <Icon name="CheckCircle" size={18} />
            Вступить
          </button>
          <button
            onClick={handleDecline}
            className="btn-red flex-1 py-4 rounded-lg text-base flex items-center justify-center gap-2"
          >
            <Icon name="XCircle" size={18} />
            Отказаться
          </button>
        </div>
      </div>
    </div>
  );
}