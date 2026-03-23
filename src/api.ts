import { User, Message, AllianceEvent } from "./types";

const API_URL = "https://functions.poehali.dev/497b0d55-589a-4944-980a-88b6f37796ca";

async function post(action: string, body: object) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  return res.json();
}

export async function fetchData(): Promise<{
  members: User[];
  messages: Message[];
  rules: { id: number; text: string }[];
  events: AllianceEvent[];
}> {
  const res = await fetch(API_URL);
  return res.json();
}

export async function apiRegister(nickname: string, rank = "recruit"): Promise<{ user: User; existed: boolean }> {
  return post("register", { nickname, rank });
}

export async function apiSendMessage(msg: Omit<Message, "id">): Promise<Message> {
  return post("send_message", msg);
}

export async function apiDeleteMessage(messageId: string): Promise<void> {
  await post("delete_message", { messageId });
}

export async function apiSetRank(userId: string, rank: string): Promise<void> {
  await post("set_rank", { userId, rank });
}

export async function apiSetNickname(userId: string, nickname: string): Promise<void> {
  await post("set_nickname", { userId, nickname });
}

export async function apiDeleteUser(userId: string): Promise<void> {
  await post("delete_user", { userId });
}

export async function apiAddRule(text: string): Promise<{ id: number; text: string; position: number }> {
  return post("add_rule", { text });
}

export async function apiDeleteRule(id: number): Promise<void> {
  await post("delete_rule", { id });
}

export async function apiAddEvent(event: Omit<AllianceEvent, "id">): Promise<AllianceEvent> {
  return post("add_event", event);
}

export async function apiDeleteEvent(id: string): Promise<void> {
  await post("delete_event", { id });
}
