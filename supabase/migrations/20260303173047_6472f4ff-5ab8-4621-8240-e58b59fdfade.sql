ALTER TABLE products ADD COLUMN IF NOT EXISTS icon_emoji text DEFAULT '📦';
ALTER TABLE products ADD COLUMN IF NOT EXISTS icon_bg_color text DEFAULT 'bg-blue';