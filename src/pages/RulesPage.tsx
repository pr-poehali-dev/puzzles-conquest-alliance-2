import { User } from "../types";

interface RulesPageProps {
  rules: string[];
  currentUser: User | null;
}

export default function RulesPage({ rules }: RulesPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">📜</div>
        <h1 className="font-cinzel text-3xl font-black mb-2" style={{ color: 'var(--gold-bright)' }}>
          Законы ОРДЫ
        </h1>
        <p className="text-gray-500 font-raleway text-sm">Обязательны для каждого воина альянса</p>
        <div className="ornament-line mt-4 max-w-xs mx-auto" />
      </div>

      {/* Декоративная рамка */}
      <div className="horde-card rounded-2xl p-8 relative overflow-hidden">
        {/* Угловые украшения */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl" style={{ borderColor: 'var(--gold-dim)' }} />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr" style={{ borderColor: 'var(--gold-dim)' }} />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl" style={{ borderColor: 'var(--gold-dim)' }} />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br" style={{ borderColor: 'var(--gold-dim)' }} />

        {/* Заголовок в рамке */}
        <div className="text-center mb-6">
          <span className="font-cinzel text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(240,180,41,0.5)' }}>
            Клятва воина ОРДЫ
          </span>
        </div>

        <div className="space-y-4">
          {rules.map((rule, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl transition-all hover:bg-white/3"
              style={{ border: '1px solid rgba(240,180,41,0.08)' }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-cinzel font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #6b0000, #b8860b)',
                  color: '#ffd700',
                  boxShadow: '0 0 10px rgba(240,180,41,0.2)',
                }}>
                {i + 1}
              </div>
              <div className="pt-1">
                <p className="font-raleway text-gray-200 leading-relaxed">{rule}</p>
              </div>
            </div>
          ))}
        </div>

        {rules.length === 0 && (
          <div className="text-center py-8 text-gray-600 font-raleway">
            Правила пока не установлены
          </div>
        )}

        <div className="ornament-line mt-8" />

        <p className="text-center text-xs text-gray-600 font-raleway mt-4">
          Нарушение правил ведёт к исключению из рядов ОРДЫ
        </p>
      </div>
    </div>
  );
}
