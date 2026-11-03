-- Public "Góp ý – Phản hồi" board: a feedback shows on the website only when an admin publishes it together with the school's reply.
ALTER TABLE feedbacks ADD COLUMN reply     TEXT;
ALTER TABLE feedbacks ADD COLUMN reply_en  TEXT;
ALTER TABLE feedbacks ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_feedbacks_published ON feedbacks (published, created_at DESC);
