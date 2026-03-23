
CREATE TABLE t_p99769052_puzzles_conquest_all.users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  rank TEXT NOT NULL DEFAULT 'recruit',
  avatar TEXT,
  joined_at TEXT NOT NULL,
  online BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p99769052_puzzles_conquest_all.messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  rank TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  text TEXT,
  media_url TEXT,
  media_type TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p99769052_puzzles_conquest_all.rules (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p99769052_puzzles_conquest_all.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO t_p99769052_puzzles_conquest_all.rules (text, position) VALUES
  ('Уважать всех участников альянса', 0),
  ('Участвовать в альянсовых войнах обязательно', 1),
  ('Донатить в альянсовый сундук минимум 500 в неделю', 2),
  ('Не вступать в союзы с врагами ОРДЫ', 3),
  ('Активность — не менее 3 дней в неделю', 4);

INSERT INTO t_p99769052_puzzles_conquest_all.events (id, title, description, date, type) VALUES
  ('e1', 'Война альянсов', 'Великое сражение против альянса Стальные Клинки', '2026-03-28', 'war'),
  ('e2', 'Турнир героев', 'Внутренний турнир — призы победителям', '2026-04-05', 'tournament'),
  ('e3', 'Сбор ресурсов', 'Общий сбор ресурсов для усиления замка', '2026-04-10', 'gather');
