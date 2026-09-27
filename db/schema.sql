CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE, phone VARCHAR(10), password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT NOT NULL DEFAULT '', sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT NOT NULL, price BIGINT NOT NULL CHECK(price >= 0),
  image_url TEXT NOT NULL, dietary_tags TEXT[] NOT NULL DEFAULT '{}', spicy_level INT NOT NULL DEFAULT 0 CHECK(spicy_level BETWEEN 0 AND 5), is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','preparing','delivered','failed')),
  customer_name TEXT NOT NULL, customer_phone VARCHAR(10) NOT NULL, customer_address TEXT NOT NULL, customer_city TEXT NOT NULL CHECK(customer_city IN ('Kathmandu','Pokhara')), customer_email TEXT,
  payment_method TEXT NOT NULL DEFAULT 'khalti', subtotal BIGINT NOT NULL CHECK(subtotal >= 0), delivery_fee BIGINT NOT NULL DEFAULT 0, total BIGINT NOT NULL CHECK(total >= 0), khalti_pidx TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status); CREATE INDEX IF NOT EXISTS idx_orders_khalti_pidx ON orders(khalti_pidx);
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL, unit_price BIGINT NOT NULL, quantity INT NOT NULL CHECK(quantity > 0), line_total BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE, pidx TEXT UNIQUE NOT NULL, status TEXT NOT NULL,
  amount BIGINT NOT NULL, payment_gateway TEXT NOT NULL DEFAULT 'khalti', transaction_id TEXT, raw_response JSONB, verified_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO categories(name,slug,description,sort_order) VALUES
('Thakali Khana Set','thakali','Soulful Himalayan plates from the Thakali tradition.',1),
('Newari Feast','newari','Heritage flavors inspired by the Kathmandu Valley.',2),
('Sekuwa Corner','sekuwa','Smoky charcoal-grilled Nepali favorites.',3),
('Momos & Snacks','momos-snacks','Street-food classics, made fresh to order.',4),
('Desserts & Drinks','desserts-drinks','Sweet finishes and refreshing Nepali beverages.',5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items(category_id,name,slug,description,price,image_url,dietary_tags,spicy_level) SELECT c.id,v.name,v.slug,v.description,v.price,v.image_url,v.tags,v.spicy FROM categories c JOIN (VALUES
('thakali','Thakali Khana Set','thakali-khana-set','Steamed rice, dal, gundruk ko jhol, saag, achar, seasonal tarkari and your choice of chicken or veg. ',420,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEIQKTsdMVKD8biNm7-c5v_gxrw9BfYmhBaISd02bdYg&s=10',ARRAY['non-veg','gluten-free']::text[],2),
('thakali','Mitho Veg Thakali Set','mitho-veg-thakali','A wholesome plant-forward Thakali plate with dal, saag, beans, tarkari and tangy tomato achar.',340,'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',ARRAY['vegetarian','gluten-free']::text[],1),
('newari','Newari Samay Baji','newari-samay-baji','Beaten rice, bara, aloo tama, bhatmas, achar, egg and choila-inspired sides.',520,'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85',ARRAY['non-veg']::text[],3),
('newari','Buff Choila','buff-choila','Smoky spiced buff strips tossed with garlic, ginger, green chilli and mustard oil.',380,'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85',ARRAY['non-veg','high-protein']::text[],4),
('sekuwa','Chicken Sekuwa','chicken-sekuwa','Charcoal-grilled marinated chicken skewers with timbur chilli achar.',390,'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',ARRAY['non-veg','high-protein']::text[],4),
('sekuwa','Pork Sekuwa','pork-sekuwa','Juicy pork pieces marinated Nepali-style and grilled over live charcoal.',430,'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85',ARRAY['non-veg']::text[],3),
('momos-snacks','Jhol Momo','jhol-momo','Steamed chicken momos bathing in a sesame-tomato-jhol with timbur and herbs.',320,'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=900&q=85',ARRAY['non-veg']::text[],3),
('momos-snacks','Kothey Veg Momo','kothey-veg-momo','Pan-fried vegetable dumplings, crisp-bottomed and served with chilli-tomato achar.',280,'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=85',ARRAY['vegetarian']::text[],2),
('momos-snacks','Aloo Tama','aloo-tama','Classic potato and bamboo shoot curry with Nepali spices.',240,'https://images.unsplash.com/photo-1601050690294-397f3c324515?auto=format&fit=crop&w=900&q=85',ARRAY['vegan','gluten-free']::text[],3),
('desserts-drinks','Sel Roti & Dahi','sel-roti-dahi','Crisp ring-shaped sel roti with cool local yogurt and a touch of honey.',220,'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',ARRAY['vegetarian']::text[],0),
('desserts-drinks','Masala Chiyaa','masala-chiyaa','Nepali milk tea simmered with cardamom, cinnamon and clove.',110,'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85',ARRAY['vegetarian']::text[],1),
('desserts-drinks','Lapsi Lemonade','lapsi-lemonade','Tangy lapsi fruit cooler with lemon and a hint of rock salt.',160,'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85',ARRAY['vegan','gluten-free']::text[],1)
) AS v(cat,name,slug,description,price,image_url,tags,spicy) ON c.slug=v.cat ON CONFLICT (slug) DO NOTHING;
