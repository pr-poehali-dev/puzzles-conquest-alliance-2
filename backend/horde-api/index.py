"""
API альянса ОРДА — управление участниками, сообщениями, правилами и событиями.
"""
import json
import os
import psycopg2
from datetime import datetime

SCHEMA = "t_p99769052_puzzles_conquest_all"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

def ok(data):
    return {"statusCode": 200, "headers": {**cors_headers(), "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}

def err(msg, code=400):
    return {"statusCode": code, "headers": {**cors_headers(), "Content-Type": "application/json"}, "body": json.dumps({"error": msg}, ensure_ascii=False)}

def get_all_data():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT id, nickname, rank, avatar, joined_at, online FROM {SCHEMA}.users ORDER BY CASE rank WHEN 'leader' THEN 0 WHEN 'officer' THEN 1 WHEN 'veteran' THEN 2 WHEN 'warrior' THEN 3 ELSE 4 END, created_at")
    members = [{"id": r[0], "nickname": r[1], "rank": r[2], "avatar": r[3], "joinedAt": r[4], "online": r[5]} for r in cur.fetchall()]
    cur.execute(f"SELECT id, user_id, nickname, rank, type, text, media_url, media_type, timestamp FROM {SCHEMA}.messages ORDER BY timestamp ASC LIMIT 200")
    messages = [{"id": r[0], "userId": r[1], "nickname": r[2], "rank": r[3], "type": r[4], "text": r[5], "mediaUrl": r[6], "mediaType": r[7], "timestamp": r[8]} for r in cur.fetchall()]
    cur.execute(f"SELECT id, text FROM {SCHEMA}.rules ORDER BY position, id")
    rules = [{"id": r[0], "text": r[1]} for r in cur.fetchall()]
    cur.execute(f"SELECT id, title, description, date, type FROM {SCHEMA}.events ORDER BY date ASC")
    events = [{"id": r[0], "title": r[1], "description": r[2], "date": r[3], "type": r[4]} for r in cur.fetchall()]
    conn.close()
    return {"members": members, "messages": messages, "rules": rules, "events": events}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = qs.get("action") or body.get("action", "")

    # GET — возвращаем все данные
    if method == "GET":
        return ok(get_all_data())

    if method != "POST":
        return err("Метод не поддерживается", 405)

    # register
    if action == "register":
        nickname = (body.get("nickname") or "").strip()
        if not nickname:
            return err("Ник не указан")
        nickname_safe = nickname.replace("'", "''")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, nickname, rank, avatar, joined_at, online FROM {SCHEMA}.users WHERE LOWER(nickname) = LOWER('{nickname_safe}')")
        row = cur.fetchone()
        if row:
            conn.close()
            return ok({"user": {"id": row[0], "nickname": row[1], "rank": row[2], "avatar": row[3], "joinedAt": row[4], "online": True}, "existed": True})
        uid = str(int(datetime.now().timestamp() * 1000))
        rank = body.get("rank", "recruit")
        joined = datetime.now().strftime("%Y-%m-%d")
        cur.execute(f"INSERT INTO {SCHEMA}.users (id, nickname, rank, joined_at, online) VALUES ('{uid}', '{nickname_safe}', '{rank}', '{joined}', true)")
        conn.commit()
        conn.close()
        return ok({"user": {"id": uid, "nickname": nickname, "rank": rank, "avatar": None, "joinedAt": joined, "online": True}, "existed": False})

    # set_rank
    if action == "set_rank":
        uid = body.get("userId", "")
        rank = body.get("rank", "")
        if not uid or not rank:
            return err("userId и rank обязательны")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.users SET rank = '{rank}' WHERE id = '{uid}'")
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # set_nickname
    if action == "set_nickname":
        uid = body.get("userId", "")
        nickname = (body.get("nickname") or "").strip()
        if not uid or not nickname:
            return err("userId и nickname обязательны")
        nickname_safe = nickname.replace("'", "''")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.users SET nickname = '{nickname_safe}' WHERE id = '{uid}'")
        cur.execute(f"UPDATE {SCHEMA}.messages SET nickname = '{nickname_safe}' WHERE user_id = '{uid}'")
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # delete_user
    if action == "delete_user":
        uid = body.get("userId", "")
        if not uid:
            return err("userId обязателен")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.users WHERE id = '{uid}'")
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # send_message
    if action == "send_message":
        mid = str(int(datetime.now().timestamp() * 1000))
        uid = body.get("userId", "")
        nickname = (body.get("nickname") or "").strip().replace("'", "''")
        rank = body.get("rank", "recruit")
        mtype = body.get("type", "text")
        text = (body.get("text") or "").replace("'", "''")
        media_url = body.get("mediaUrl") or None
        media_type = body.get("mediaType") or None
        ts = body.get("timestamp", int(datetime.now().timestamp() * 1000))
        media_url_sql = f"'{media_url}'" if media_url else "NULL"
        media_type_sql = f"'{media_type}'" if media_type else "NULL"
        text_sql = f"'{text}'" if text else "NULL"
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"INSERT INTO {SCHEMA}.messages (id, user_id, nickname, rank, type, text, media_url, media_type, timestamp) VALUES ('{mid}', '{uid}', '{nickname}', '{rank}', '{mtype}', {text_sql}, {media_url_sql}, {media_type_sql}, {ts})")
        conn.commit()
        conn.close()
        return ok({"id": mid, "userId": uid, "nickname": body.get("nickname", ""), "rank": rank, "type": mtype, "text": body.get("text"), "mediaUrl": media_url, "mediaType": media_type, "timestamp": ts})

    # delete_message
    if action == "delete_message":
        mid = body.get("messageId", "")
        if not mid:
            return err("messageId обязателен")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.messages WHERE id = '{mid}'")
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # add_rule
    if action == "add_rule":
        text = (body.get("text") or "").strip().replace("'", "''")
        if not text:
            return err("Текст правила обязателен")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COALESCE(MAX(position), -1) + 1 FROM {SCHEMA}.rules")
        pos = cur.fetchone()[0]
        cur.execute(f"INSERT INTO {SCHEMA}.rules (text, position) VALUES ('{text}', {pos}) RETURNING id")
        rid = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({"id": rid, "text": body.get("text"), "position": pos})

    # delete_rule
    if action == "delete_rule":
        rid = body.get("id")
        if rid is None:
            return err("id обязателен")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.rules WHERE id = {int(rid)}")
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # add_event
    if action == "add_event":
        eid = str(int(datetime.now().timestamp() * 1000))
        title = (body.get("title") or "").strip().replace("'", "''")
        desc = (body.get("description") or "").strip().replace("'", "''")
        date = body.get("date", "")
        etype = body.get("type", "other")
        if not title or not date:
            return err("title и date обязательны")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"INSERT INTO {SCHEMA}.events (id, title, description, date, type) VALUES ('{eid}', '{title}', '{desc}', '{date}', '{etype}')")
        conn.commit()
        conn.close()
        return ok({"id": eid, "title": body.get("title"), "description": body.get("description", ""), "date": date, "type": etype})

    # delete_event
    if action == "delete_event":
        eid = body.get("id", "")
        if not eid:
            return err("id обязателен")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.events WHERE id = '{eid}'")
        conn.commit()
        conn.close()
        return ok({"ok": True})

    return err("Действие не найдено", 404)
