-- Per-entry editors: an EDITOR account manages the posts of exactly one menu entry (and its children).
ALTER TABLE users ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX idx_users_category ON users (category_id);
