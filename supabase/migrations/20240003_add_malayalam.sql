INSERT INTO categories (label, slug) VALUES ('Malayalam', 'malayalam') ON CONFLICT (slug) DO NOTHING;
