-- English versions of the visitor-facing text. NULL/blank = not translated yet; the site then falls back to Vietnamese.
ALTER TABLE categories  ADD COLUMN name_en        VARCHAR(100);
ALTER TABLE categories  ADD COLUMN description_en TEXT;
ALTER TABLE posts       ADD COLUMN title_en       VARCHAR(500);
ALTER TABLE posts       ADD COLUMN summary_en     TEXT;
ALTER TABLE post_blocks ADD COLUMN content_en     TEXT;
