-- Featured posts: the posts an admin picks for the home-page slider (after the banner).
ALTER TABLE posts ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_posts_featured ON posts (published_at DESC) WHERE featured;

-- Photo library: entries of page type GALLERY hold image-only posts and feed the home "Thư viện ảnh".
-- Give existing sites one such entry (page_type has no CHECK, so the new type needs no schema change).
INSERT INTO categories (parent_id, name, slug, page_type, sort_order, show_on_home, description)
SELECT p.id, 'Kho ảnh', 'kho-anh', 'GALLERY',
       COALESCE((SELECT max(c.sort_order) + 1 FROM categories c WHERE c.parent_id = p.id), 0), FALSE,
       'Hình ảnh các hoạt động của thầy và trò nhà trường.'
FROM categories p
WHERE p.slug = 'tin-tuc-su-kien' AND p.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.slug = 'kho-anh');
