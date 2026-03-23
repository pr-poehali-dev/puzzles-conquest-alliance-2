import { AllianceEvent, User } from "../types";

interface EventsPageProps {
  events: AllianceEvent[];
  currentUser: User | null;
}

const typeLabel: Record<string, { label: string; icon: string; color: string }> = {
  war: { label: "Война", icon: "⚔️", color: "rgba(220,38,38,0.2)" },
  tournament: { label: "Турнир", icon: "🏆", color: "rgba(234,179,8,0.15)" },
  gather: { label: "Сбор ресурсов", icon: "💎", color: "rgba(59,130,246,0.15)" },
  other: { label: "Событие", icon: "📌", color: "rgba(99,102,241,0.15)" },
};

const getDaysLeft = (date: string) => {
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: "Прошло", urgent: false };
  if (days === 0) return { text: "Сегодня!", urgent: true };
  if (days === 1) return { text: "Завтра", urgent: true };
  return { text: `${days} дн.`, urgent: days <= 3 };
};

export default function EventsPage({ events }: EventsPageProps) {
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">📅</div>
        <h1 className="font-cinzel text-3xl font-black mb-2" style={{ color: 'var(--gold-bright)' }}>
          События ОРДЫ
        </h1>
        <p className="text-gray-500 font-raleway text-sm">{events.length} запланировано</p>
        <div className="ornament-line mt-4 max-w-xs mx-auto" />
      </div>

      <div className="space-y-4">
        {sorted.map(ev => {
          const t = typeLabel[ev.type] || typeLabel.other;
          const days = getDaysLeft(ev.date);
          return (
            <div key={ev.id}
              className="horde-card rounded-xl p-6 hover:border-yellow-400/30 transition-all"
              style={{ borderLeft: `3px solid ${t.color.replace('0.2)', '0.8)')}` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl mt-0.5">{t.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-cinzel font-bold text-lg" style={{ color: 'var(--gold)' }}>
                        {ev.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded font-raleway"
                        style={{ background: t.color, color: 'rgba(240,220,180,0.8)' }}>
                        {t.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-raleway leading-relaxed">{ev.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-600 font-raleway">📅 {ev.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`text-sm font-cinzel font-bold px-3 py-1.5 rounded-lg ${
                    days.urgent ? "text-red-400" : "text-yellow-600"
                  }`}
                    style={{ background: days.urgent ? 'rgba(220,38,38,0.1)' : 'rgba(240,180,41,0.08)' }}>
                    {days.text}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="horde-card rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 font-raleway">Событий пока нет. Глава добавит их позже.</p>
          </div>
        )}
      </div>
    </div>
  );
}
