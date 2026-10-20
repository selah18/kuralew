PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS listings (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 price INTEGER NOT NULL CHECK(price > 0),
 category TEXT NOT NULL,
 condition TEXT NOT NULL,
 city TEXT NOT NULL,
 seller TEXT NOT NULL,
 description TEXT NOT NULL,
 image_url TEXT,
 status TEXT NOT NULL DEFAULT 'active',
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE TABLE IF NOT EXISTS reports (
 id TEXT PRIMARY KEY,
 listing_id TEXT NOT NULL,
 reason TEXT NOT NULL,
 note TEXT,
 created_at TEXT NOT NULL
);
