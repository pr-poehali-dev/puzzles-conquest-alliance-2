export type Rank = "leader" | "officer" | "veteran" | "warrior" | "recruit";

export interface User {
  id: string;
  nickname: string;
  rank: Rank;
  avatar: string | null;
  joinedAt: string;
  online: boolean;
}

export interface Message {
  id: string;
  userId: string;
  nickname: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
  timestamp: number;
  type: "text" | "image" | "video" | "audio";
  rank: Rank;
  translated?: string;
}

export interface AllianceEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "war" | "tournament" | "gather" | "other";
}

export interface RuleItem {
  id: number;
  text: string;
}

export interface AppState {
  currentUser: User | null;
  members: User[];
  messages: Message[];
  rules: string[];
  rulesWithIds?: RuleItem[];
  events: AllianceEvent[];
  page: "home" | "chat" | "members" | "rules" | "events" | "join" | "leader";
}

export const RANK_LABELS: Record<Rank, string> = {
  leader: "⚔️ Глава",
  officer: "🛡️ Офицер",
  veteran: "🌟 Ветеран",
  warrior: "⚒️ Воин",
  recruit: "🗡️ Новобранец",
};

export const RANK_ORDER: Rank[] = ["leader", "officer", "veteran", "warrior", "recruit"];