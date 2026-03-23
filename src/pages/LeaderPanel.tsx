import { useState } from "react";
import { AppState, Rank, RANK_LABELS, RANK_ORDER, AllianceEvent, RuleItem } from "../types";
import Icon from "@/components/ui/icon";

interface LeaderPanelProps {
  state: AppState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateState: (updates: any) => Promise<void>;
}

type Tab = "members" | "rules" | "events" | "settings";

export default function LeaderPanel({ state, onUpdateState }: LeaderPanelProps) {
  const [tab, setTab] = useState<Tab>("members");
  const [newRule, setNewRule] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventType, setNewEventType] = useState<AllianceEvent["type"]>("war");
  const [newNick, setNewNick] = useState(state.currentUser?.nickname || "");
  const [nickSaved, setNickSaved] = useState(false);

  const setRank = async (userId: string, rank: Rank) => {
    await onUpdateState({ _setRank: { userId, rank } });
  };

  const removeMember = async (userId: string) => {
    if (userId === state.currentUser?.id) return;
    await onUpdateState({ _deleteUser: userId });
  };

  const addRule = async () => {
    if (!newRule.trim()) return;
    await onUpdateState({ _addRule: newRule.trim() });
    setNewRule("");
  };

  const removeRule = async (ruleId: number) => {
    await onUpdateState({ _deleteRule: ruleId });
  };

  const addEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    const ev: Omit<AllianceEvent, "id"> = {
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      date: newEventDate,
      type: newEventType,
    };
    await onUpdateState({ _addEvent: ev });
    setNewEventTitle("");
    setNewEventDesc("");
    setNewEventDate("");
  };

  const removeEvent = async (id: string) => {
    await onUpdateState({ _deleteEvent: id });
  };

  const saveNick = async () => {
    if (!newNick.trim() || !state.currentUser) return;
    await onUpdateState({ _setNickname: { userId: state.currentUser.id, nickname: newNick.trim() } });
    setNickSaved(true);
    setTimeout(() => setNickSaved(false), 2000);
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "members", label: "Участники", icon: "Users" },
    { key: "rules", label: "Правила", icon: "ScrollText" },
    { key: "events", label: "События", icon: "Calendar" },
    { key: "settings", label: "Настройки", icon: "Settings" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">👑</div>
        <h1 className="font-cinzel text-3xl font-black mb-1" style={{ color: 'var(--gold-bright)' }}>
          Панель Главы
        </h1>
        <p className="text-gray-500 font-raleway text-sm">Управление альянсом ОРДА</p>
        <div className="ornament-line mt-4 max-w-xs mx-auto" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-cinzel font-medium whitespace-nowrap transition-all ${
              tab === t.key ? "text-black" : "text-gray-400 hover:text-yellow-400"
            }`}
            style={tab === t.key
              ? { background: 'linear-gradient(135deg, #b8860b, #ffd700)' }
              : { border: '1px solid rgba(240,180,41,0.2)' }
            }
          >
            <Icon name={t.icon} fallback="Circle" size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* MEMBERS TAB */}
      {tab === "members" && (
        <div className="space-y-3">
          {state.members.map(member => (
            <div key={member.id} className="horde-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-cinzel font-bold"
                  style={{ background: 'rgba(139,0,0,0.5)', border: '1px solid rgba(240,180,41,0.3)' }}>
                  {member.nickname.charAt(0)}
                </div>
                <div>
                  <div className="font-raleway font-medium text-sm" style={{ color: '#f0e6c0' }}>{member.nickname}</div>
                  <div className={`text-xs rank-${member.rank}`}>{RANK_LABELS[member.rank]}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={member.rank}
                  onChange={e => setRank(member.id, e.target.value as Rank)}
                  className="px-3 py-1.5 rounded-lg text-xs font-raleway outline-none"
                  style={{
                    background: 'rgba(13,17,23,0.9)',
                    border: '1px solid rgba(240,180,41,0.25)',
                    color: '#f0e6c0',
                  }}
                  disabled={member.rank === "leader"}
                >
                  {RANK_ORDER.map(r => (
                    <option key={r} value={r}>{RANK_LABELS[r]}</option>
                  ))}
                </select>

                {member.id !== state.currentUser?.id && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-400 hover:bg-red-900/20 transition-all"
                    title="Исключить"
                  >
                    <Icon name="UserX" size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RULES TAB */}
      {tab === "rules" && (
        <div className="space-y-4">
          {/* Add rule */}
          <div className="horde-card rounded-xl p-5">
            <h3 className="font-cinzel text-sm font-bold mb-3" style={{ color: 'var(--gold)' }}>Добавить правило</h3>
            <div className="flex gap-3">
              <input
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                placeholder="Текст нового правила..."
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-raleway outline-none"
                style={{
                  background: 'rgba(13,17,23,0.8)',
                  border: '1px solid rgba(240,180,41,0.2)',
                  color: '#f0e6c0',
                }}
                onKeyDown={e => e.key === "Enter" && addRule()}
              />
              <button onClick={addRule} className="btn-gold px-5 py-2.5 rounded-lg text-sm">
                <Icon name="Plus" size={16} />
              </button>
            </div>
          </div>

          {/* Rules list */}
          <div className="space-y-2">
            {(state.rulesWithIds ?? state.rules.map((t, i) => ({ id: i, text: t } as RuleItem))).map((rule, i) => (
              <div key={rule.id} className="horde-card rounded-lg p-4 flex items-start gap-3 group">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-cinzel flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(139,0,0,0.5)', color: 'var(--gold)' }}>
                  {i + 1}
                </div>
                <p className="flex-1 text-sm font-raleway text-gray-200">{rule.text}</p>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="text-red-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENTS TAB */}
      {tab === "events" && (
        <div className="space-y-5">
          {/* Add event */}
          <div className="horde-card rounded-xl p-6">
            <h3 className="font-cinzel text-sm font-bold mb-4" style={{ color: 'var(--gold)' }}>Добавить событие</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Название события"
                className="px-4 py-2.5 rounded-lg text-sm font-raleway outline-none"
                style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(240,180,41,0.2)', color: '#f0e6c0' }} />
              <input value={newEventDate} onChange={e => setNewEventDate(e.target.value)} type="date"
                className="px-4 py-2.5 rounded-lg text-sm font-raleway outline-none"
                style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(240,180,41,0.2)', color: '#f0e6c0', colorScheme: 'dark' }} />
              <textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="Описание"
                rows={2}
                className="px-4 py-2.5 rounded-lg text-sm font-raleway outline-none resize-none"
                style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(240,180,41,0.2)', color: '#f0e6c0' }} />
              <div className="flex flex-col gap-3">
                <select value={newEventType} onChange={e => setNewEventType(e.target.value as AllianceEvent["type"])}
                  className="px-4 py-2.5 rounded-lg text-sm font-raleway outline-none"
                  style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(240,180,41,0.2)', color: '#f0e6c0' }}>
                  <option value="war">⚔️ Война</option>
                  <option value="tournament">🏆 Турнир</option>
                  <option value="gather">💎 Сбор ресурсов</option>
                  <option value="other">📌 Другое</option>
                </select>
                <button onClick={addEvent} className="btn-gold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                  <Icon name="Plus" size={14} />
                  Добавить
                </button>
              </div>
            </div>
          </div>

          {/* Events list */}
          <div className="space-y-3">
            {state.events.map(ev => (
              <div key={ev.id} className="horde-card rounded-lg p-4 flex items-start gap-3 group">
                <div className="flex-1">
                  <div className="font-cinzel font-semibold text-sm mb-0.5" style={{ color: 'var(--gold)' }}>{ev.title}</div>
                  <div className="text-xs text-gray-400 font-raleway">{ev.description}</div>
                  <div className="text-xs text-gray-600 font-raleway mt-1">📅 {ev.date}</div>
                </div>
                <button onClick={() => removeEvent(ev.id)}
                  className="text-red-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === "settings" && (
        <div className="max-w-md">
          <div className="horde-card rounded-xl p-6 space-y-5">
            <h3 className="font-cinzel font-bold text-lg" style={{ color: 'var(--gold)' }}>⚙️ Настройки главы</h3>

            <div>
              <label className="block text-xs font-cinzel text-gray-400 mb-2">Изменить никнейм</label>
              <div className="flex gap-3">
                <input
                  value={newNick}
                  onChange={e => setNewNick(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-raleway outline-none"
                  style={{
                    background: 'rgba(13,17,23,0.8)',
                    border: '1px solid rgba(240,180,41,0.2)',
                    color: '#f0e6c0',
                  }}
                  onKeyDown={e => e.key === "Enter" && saveNick()}
                />
                <button onClick={saveNick} className="btn-gold px-5 py-2.5 rounded-lg text-sm whitespace-nowrap">
                  {nickSaved ? "✓ Сохранено" : "Сохранить"}
                </button>
              </div>
            </div>

            <div className="ornament-line" />

            <div className="p-4 rounded-lg" style={{ background: 'rgba(240,180,41,0.05)', border: '1px solid rgba(240,180,41,0.1)' }}>
              <p className="text-xs font-cinzel text-gray-500 mb-1">Пароль главы</p>
              <p className="text-sm font-raleway text-gray-300">Используется при входе. Не меняй без причины.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}