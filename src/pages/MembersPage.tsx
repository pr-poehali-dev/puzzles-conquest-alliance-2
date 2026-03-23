import { useState } from "react";
import { User, RANK_LABELS, Rank } from "../types";
import Icon from "@/components/ui/icon";

interface MembersPageProps {
  members: User[];
  currentUser: User;
}

const RANK_ORDER: Rank[] = ["leader", "officer", "veteran", "warrior", "recruit"];

const rankColor: Record<Rank, string> = {
  leader: "text-yellow-400",
  officer: "text-purple-400",
  veteran: "text-blue-400",
  warrior: "text-green-400",
  recruit: "text-gray-400",
};

const rankBg: Record<Rank, string> = {
  leader: "rgba(255,215,0,0.1)",
  officer: "rgba(192,132,252,0.1)",
  veteran: "rgba(96,165,250,0.1)",
  warrior: "rgba(74,222,128,0.1)",
  recruit: "rgba(148,163,184,0.08)",
};

export default function MembersPage({ members, currentUser }: MembersPageProps) {
  const [search, setSearch] = useState("");
  const [filterRank, setFilterRank] = useState<Rank | "all">("all");

  const filtered = members
    .filter(m => filterRank === "all" || m.rank === filterRank)
    .filter(m => m.nickname.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">⚔️</div>
        <h1 className="font-cinzel text-3xl font-black mb-2" style={{ color: 'var(--gold-bright)' }}>
          Воины ОРДЫ
        </h1>
        <p className="text-gray-500 font-raleway text-sm">{members.length} бойцов в рядах альянса</p>
        <div className="ornament-line mt-4 max-w-xs mx-auto" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по нику..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm font-raleway outline-none"
            style={{
              background: 'rgba(13,17,23,0.8)',
              border: '1px solid rgba(240,180,41,0.2)',
              color: '#f0e6c0',
            }}
          />
        </div>
        <select
          value={filterRank}
          onChange={e => setFilterRank(e.target.value as Rank | "all")}
          className="px-4 py-2.5 rounded-lg text-sm font-raleway outline-none"
          style={{
            background: 'rgba(13,17,23,0.8)',
            border: '1px solid rgba(240,180,41,0.2)',
            color: '#f0e6c0',
          }}
        >
          <option value="all">Все ранги</option>
          {RANK_ORDER.map(r => (
            <option key={r} value={r}>{RANK_LABELS[r]}</option>
          ))}
        </select>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {RANK_ORDER.map(rank => {
          const count = members.filter(m => m.rank === rank).length;
          return (
            <div key={rank} className="horde-card rounded-lg p-3 text-center">
              <div className={`font-cinzel text-xl font-bold ${rankColor[rank]}`}>{count}</div>
              <div className="text-xs text-gray-600 font-raleway mt-0.5">{RANK_LABELS[rank].split(" ")[1] || RANK_LABELS[rank]}</div>
            </div>
          );
        })}
      </div>

      {/* Members grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map(member => (
          <div key={member.id}
            className="horde-card rounded-xl p-4 flex items-center gap-4 hover:border-yellow-400/30 transition-all"
            style={{ borderColor: member.id === currentUser.id ? 'rgba(240,180,41,0.5)' : undefined }}>
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-cinzel font-black"
                style={{
                  background: `linear-gradient(135deg, rgba(139,0,0,0.7), rgba(60,0,0,0.9))`,
                  border: `2px solid ${rankBg[member.rank].replace('0.1)', '0.6)')}`,
                  boxShadow: member.rank === "leader" ? '0 0 15px rgba(255,215,0,0.4)' : undefined,
                }}>
                {member.avatar
                  ? <img src={member.avatar} alt={member.nickname} className="w-full h-full rounded-full object-cover" />
                  : member.nickname.charAt(0)
                }
              </div>
              {member.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2"
                  style={{ borderColor: 'var(--dark-bg)' }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-raleway font-semibold text-sm truncate" style={{ color: '#f0e6c0' }}>
                  {member.nickname}
                </span>
                {member.id === currentUser.id && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-raleway" style={{ background: 'rgba(240,180,41,0.15)', color: 'var(--gold)' }}>Я</span>
                )}
              </div>
              <div className={`text-xs font-raleway ${rankColor[member.rank]}`}>{RANK_LABELS[member.rank]}</div>
              <div className="text-xs text-gray-600 font-raleway mt-0.5">с {member.joinedAt}</div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {member.online
                ? <span className="text-xs text-green-400 font-raleway">онлайн</span>
                : <span className="text-xs text-gray-600 font-raleway">офлайн</span>
              }
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-600 font-raleway">
            Воинов не найдено
          </div>
        )}
      </div>
    </div>
  );
}
