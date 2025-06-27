-- -- ユーザーテーブル
-- CREATE TABLE IF NOT EXISTS users (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL, -- 名前
--   email TEXT NOT NULL UNIQUE,
--   password TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   last_login TIMESTAMP
-- );

-- レコードテーブル
-- CREATE TABLE IF NOT EXISTS records (
--   uuid TEXT PRIMARY KEY,
--   user_id INTEGER NOT NULL,
--   content TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES user(id)
-- );


-- テンプレートテーブル
CREATE TABLE IF NOT EXISTS templates (
  uuid TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT,
  children TEXT, -- JSON文字列として格納
  permissions_read TEXT,  -- JSON文字列として格納
  permissions_write TEXT, -- JSON文字列として格納
  createdBy TEXT,
  updatedBy TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_records_uuid ON records(uuid);
CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);
CREATE INDEX IF NOT EXISTS idx_records_content ON records(content);
CREATE INDEX IF NOT EXISTS idx_records_created_by ON records(createdBy);
CREATE INDEX IF NOT EXISTS idx_records_updated_by ON records(updatedBy);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);
CREATE INDEX IF NOT EXISTS idx_records_updated_at ON records(updated_at);