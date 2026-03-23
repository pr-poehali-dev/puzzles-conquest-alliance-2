import { User, AllianceEvent, AppState, RANK_LABELS } from "../types";
import Icon from "@/components/ui/icon";

const BANNER = "https://cdn.poehali.dev/projects/7d27eedc-d51f-4252-94d0-89eac420b04f/files/fff9e395-4068-46b4-9e5d-92dc995a755a.jpg";

interface HomePageProps {
  navigate: (p: AppState["page"]) => void;
  members: User[];
  events: AllianceEvent[];
}

const eventTypeIcon: Record<string, string> = {
  war: "⚔️", tournament: "🏆", gather: "💎", other: "📌"
};

export default function HomePage({ navigate, members, events }: HomePageProps) {
  const online = members.filter(m => m.online).length;
  const joinLink = `${window.location.origin}${window.location.pathname}#join`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink);
  };

  const upcomingEvents = events.slice(0, 2);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: '70vh' }}>
        <div className="absolute inset-0">
          <img src={BANNER} alt="ОРДА" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(7,10,15,0.3) 0%, rgba(7,10,15,0.6) 50%, rgba(7,10,15,1) 100%)'
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, rgba(139,0,0,0.2) 0%, transparent 70%)'
          }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24">
          {/* Ornament */}
          <div className="text-6xl mb-6 animate-fade-in">⚔️</div>

          <div className="mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="font-cinzel text-sm tracking-[0.3em] uppercase"
              style={{ color: 'rgba(240,180,41,0.6)' }}>
              Альянс · Puzzles Conquest
            </span>
          </div>

          <h1 className="font-cinzel font-black mb-4 animate-fade-in"
            style={{
              fontSize: 'clamp(4rem, 15vw, 10rem)',
              lineHeight: 1,
              animationDelay: '0.2s',
              background: 'linear-gradient(180deg, #ffd700 0%, #f0b429 50%, #8a6a00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 30px rgba(240,180,41,0.5))',
            }}>
            ОРДА
          </h1>

          <p className="font-raleway text-gray-400 text-lg max-w-md mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Сильнейший альянс. Железная воля. Общая победа.
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button onClick={() => navigate("join")} className="btn-gold px-8 py-3.5 rounded-lg text-base">
              Вступить в ОРДУ
            </button>
            <button onClick={() => navigate("chat")}
              className="px-8 py-3.5 rounded-lg text-base font-cinzel font-semibold transition-all hover:bg-white/10"
              style={{
                border: '1px solid rgba(240,180,41,0.4)',
                color: 'var(--gold)',
              }}>
              Открыть чат
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {[
              { label: "Участников", value: members.length },
              { label: "Онлайн", value: online },
              { label: "Событий", value: events.length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-cinzel text-3xl font-bold" style={{ color: 'var(--gold-bright)' }}>{s.value}</div>
                <div className="text-xs text-gray-500 font-raleway mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-12">

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { page: "chat" as const, icon: "MessageSquare", label: "Чат", desc: "Общайся с братьями" },
            { page: "members" as const, icon: "Users", label: "Участники", desc: "Состав альянса" },
            { page: "rules" as const, icon: "ScrollText", label: "Правила", desc: "Законы ОРДЫ" },
            { page: "events" as const, icon: "Swords", label: "События", desc: "Войны и турниры" },
          ].map(item => (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className="horde-card p-5 rounded-xl text-left hover:border-yellow-400/40 transition-all hover:-translate-y-1 group"
            >
              <Icon name={item.icon} size={24} className="text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-cinzel font-semibold text-sm mb-1" style={{ color: 'var(--gold)' }}>{item.label}</div>
              <div className="text-xs text-gray-500 font-raleway">{item.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top members */}
          <div className="horde-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel font-bold text-lg" style={{ color: 'var(--gold)' }}>⚔️ Воины ОРДЫ</h3>
              <button onClick={() => navigate("members")} className="text-xs text-gray-500 hover:text-yellow-400 transition-colors">
                Все →
              </button>
            </div>
            <div className="space-y-3">
              {members.slice(0, 4).map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-cinzel font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(139,0,0,0.6), rgba(80,0,0,0.8))', border: '1px solid rgba(240,180,41,0.3)' }}>
                    {member.nickname.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-raleway font-medium truncate" style={{ color: '#f0e6c0' }}>{member.nickname}</span>
                      {member.online && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>}
                    </div>
                    <div className={`text-xs rank-${member.rank}`}>{RANK_LABELS[member.rank]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="horde-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel font-bold text-lg" style={{ color: 'var(--gold)' }}>🗓️ Ближайшие события</h3>
              <button onClick={() => navigate("events")} className="text-xs text-gray-500 hover:text-yellow-400 transition-colors">
                Все →
              </button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,180,41,0.1)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{eventTypeIcon[ev.type]}</span>
                    <span className="font-cinzel font-semibold text-sm" style={{ color: 'var(--gold)' }}>{ev.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-raleway mb-1.5">{ev.description}</p>
                  <span className="text-xs" style={{ color: 'rgba(240,180,41,0.5)' }}>📅 {ev.date}</span>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-gray-500 text-sm font-raleway">Событий пока нет</p>
              )}
            </div>
          </div>
        </div>

        {/* Invite */}
        <div className="horde-card rounded-xl p-6 text-center glow-pulse">
          <div className="text-3xl mb-3">🔗</div>
          <h3 className="font-cinzel text-xl font-bold mb-2" style={{ color: 'var(--gold)' }}>Пригласи друга</h3>
          <p className="text-gray-400 text-sm font-raleway mb-4">Поделись ссылкой — друг нажмёт и сразу увидит форму вступления</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <div className="flex-1 px-4 py-2.5 rounded-lg text-xs font-raleway text-gray-400 truncate text-left"
              style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(240,180,41,0.2)' }}>
              {joinLink}
            </div>
            <button onClick={copyLink} className="btn-gold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
              <Icon name="Copy" size={14} />
              Копировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
