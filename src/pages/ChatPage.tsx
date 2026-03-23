import { useState, useRef, useEffect } from "react";
import { User, Message, RANK_LABELS } from "../types";
import Icon from "@/components/ui/icon";

const LANGS = [
  { code: "ru", label: "🇷🇺 Русский" },
  { code: "en", label: "🇬🇧 English" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "pt", label: "🇧🇷 Português" },
  { code: "zh", label: "🇨🇳 中文" },
  { code: "tr", label: "🇹🇷 Türkçe" },
  { code: "pl", label: "🇵🇱 Polski" },
  { code: "uk", label: "🇺🇦 Українська" },
];

interface ChatPageProps {
  currentUser: User;
  messages: Message[];
  members: User[];
  onSendMessage: (msg: Message) => void;
  onDeleteMessage: (id: string) => void;
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
};

const translateText = async (text: string, lang: string): Promise<string> => {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0]?.map((x: [string]) => x[0]).join("") || text;
  } catch {
    return text;
  }
};

export default function ChatPage({ currentUser, messages, onSendMessage, onDeleteMessage }: ChatPageProps) {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("ru");
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [showLangPicker, setShowLangPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      nickname: currentUser.nickname,
      text: text.trim(),
      timestamp: Date.now(),
      type: "text",
      rank: currentUser.rank,
    };
    onSendMessage(msg);
    setText("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      let type: Message["type"] = "image";
      if (file.type.startsWith("video")) type = "video";
      if (file.type.startsWith("audio")) type = "audio";

      const msg: Message = {
        id: Date.now().toString(),
        userId: currentUser.id,
        nickname: currentUser.nickname,
        mediaUrl: url,
        mediaType: type as "image" | "video" | "audio",
        timestamp: Date.now(),
        type,
        rank: currentUser.rank,
      };
      onSendMessage(msg);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleTranslate = async (msg: Message) => {
    if (translations[msg.id]) {
      setTranslations(t => { const n = {...t}; delete n[msg.id]; return n; });
      return;
    }
    if (!msg.text) return;
    setTranslating(msg.id);
    const result = await translateText(msg.text, targetLang);
    setTranslations(t => ({ ...t, [msg.id]: result }));
    setTranslating(null);
  };

  const isOwn = (msg: Message) => msg.userId === currentUser.id;
  const canDelete = (msg: Message) => currentUser.rank === "leader" || currentUser.rank === "officer" || msg.userId === currentUser.id;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Chat header */}
      <div className="px-4 py-3 border-b flex items-center justify-between"
        style={{ background: 'rgba(7,10,15,0.9)', borderColor: 'rgba(240,180,41,0.15)' }}>
        <div className="flex items-center gap-3">
          <Icon name="MessageSquare" size={18} className="text-yellow-500" />
          <span className="font-cinzel font-bold text-sm" style={{ color: 'var(--gold)' }}>Чат ОРДЫ</span>
          <span className="text-xs text-gray-600 font-raleway">{messages.length} сообщений</span>
        </div>

        {/* Translator toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTranslateEnabled(!translateEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-raleway transition-all ${
                translateEnabled
                  ? "text-black"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
              style={translateEnabled ? { background: 'linear-gradient(135deg, #b8860b, #ffd700)' } : { border: '1px solid rgba(240,180,41,0.3)' }}
            >
              <Icon name="Languages" size={12} />
              Перевод
            </button>
            {translateEnabled && (
              <div className="relative">
                <button
                  onClick={() => setShowLangPicker(!showLangPicker)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-raleway text-gray-300 hover:text-yellow-400 transition-colors"
                  style={{ border: '1px solid rgba(240,180,41,0.2)', background: 'rgba(13,17,23,0.8)' }}
                >
                  {LANGS.find(l => l.code === targetLang)?.label.split(" ")[0]}
                  <Icon name="ChevronDown" size={10} />
                </button>
                {showLangPicker && (
                  <div className="absolute right-0 top-full mt-1 z-20 rounded-lg py-1 w-40 shadow-xl"
                    style={{ background: '#0d1117', border: '1px solid rgba(240,180,41,0.2)' }}>
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => { setTargetLang(l.code); setShowLangPicker(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-raleway hover:bg-white/5 transition-colors ${targetLang === l.code ? "text-yellow-400" : "text-gray-300"}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 group ${isOwn(msg) ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-cinzel font-bold flex-shrink-0 mt-1"
              style={{ background: 'linear-gradient(135deg, rgba(139,0,0,0.7), rgba(80,0,0,0.9))', border: '1px solid rgba(240,180,41,0.3)' }}>
              {msg.nickname.charAt(0)}
            </div>

            <div className={`max-w-[70%] ${isOwn(msg) ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {/* Name + rank */}
              <div className={`flex items-center gap-2 ${isOwn(msg) ? "flex-row-reverse" : ""}`}>
                <span className={`text-xs font-cinzel font-semibold rank-${msg.rank}`}>{msg.nickname}</span>
                <span className="text-xs text-gray-600">{formatTime(msg.timestamp)}</span>
                <span className={`text-xs rank-${msg.rank} opacity-60`}>{RANK_LABELS[msg.rank]}</span>
              </div>

              {/* Bubble */}
              <div className={`rounded-xl px-4 py-3 relative ${isOwn(msg) ? "chat-bubble-own rounded-tr-sm" : "chat-bubble-other rounded-tl-sm"}`}>
                {msg.type === "text" && (
                  <>
                    <p className="text-sm font-raleway text-gray-200 leading-relaxed">{msg.text}</p>
                    {translations[msg.id] && (
                      <p className="text-xs font-raleway text-yellow-300/70 mt-1.5 pt-1.5 border-t border-yellow-900/30">
                        🌐 {translations[msg.id]}
                      </p>
                    )}
                  </>
                )}
                {msg.type === "image" && msg.mediaUrl && (
                  <img src={msg.mediaUrl} alt="media" className="max-w-xs rounded-lg max-h-64 object-contain" />
                )}
                {msg.type === "video" && msg.mediaUrl && (
                  <video src={msg.mediaUrl} controls className="max-w-xs rounded-lg max-h-64" />
                )}
                {msg.type === "audio" && msg.mediaUrl && (
                  <audio src={msg.mediaUrl} controls className="w-48" />
                )}

                {/* Actions */}
                <div className={`absolute top-2 ${isOwn(msg) ? "left-2" : "right-2"} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {msg.type === "text" && translateEnabled && (
                    <button
                      onClick={() => handleTranslate(msg)}
                      className="p-1 rounded text-xs hover:bg-white/10 transition-colors"
                      title="Перевести"
                      style={{ color: translating === msg.id ? '#ffd700' : 'rgba(240,180,41,0.6)' }}
                    >
                      {translating === msg.id ? "..." : "🌐"}
                    </button>
                  )}
                  {canDelete(msg) && (
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1 rounded hover:bg-red-900/30 transition-colors text-red-600 hover:text-red-400"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-600 font-raleway text-sm">
            Будь первым — напиши братьям ⚔️
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(240,180,41,0.15)', background: 'rgba(7,10,15,0.95)' }}>
        <div className="flex gap-2 items-end">
          {/* Media button */}
          <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2.5 rounded-lg text-gray-500 hover:text-yellow-400 transition-colors flex-shrink-0"
            style={{ border: '1px solid rgba(240,180,41,0.15)' }}
          >
            <Icon name="Paperclip" size={18} />
          </button>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Напиши братьям..."
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-raleway outline-none resize-none transition-all"
            style={{
              background: 'rgba(13,17,23,0.8)',
              border: '1px solid rgba(240,180,41,0.2)',
              color: '#f0e6c0',
              minHeight: '42px',
              maxHeight: '120px',
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />

          <button
            onClick={send}
            disabled={!text.trim()}
            className="p-2.5 rounded-lg flex-shrink-0 transition-all disabled:opacity-30"
            style={{
              background: text.trim() ? 'linear-gradient(135deg, #b8860b, #ffd700)' : 'rgba(30,40,30,0.5)',
              color: text.trim() ? '#0d1117' : '#555',
            }}
          >
            <Icon name="Send" size={18} />
          </button>
        </div>
        {translateEnabled && (
          <p className="text-xs text-gray-600 font-raleway mt-1.5 px-1">
            🌐 Автоперевод включён → {LANGS.find(l => l.code === targetLang)?.label}. Наведи на сообщение для перевода.
          </p>
        )}
      </div>
    </div>
  );
}
