-- Enable Row Level Security on all tables
-- This prevents the Supabase anon/public API from reading or writing data
-- Prisma connections use the postgres role which bypasses RLS

-- Enable RLS on all application tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "owner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "truck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "logTransfer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "push_subscription" ENABLE ROW LEVEL SECURITY;

-- No policies are created, so:
-- - The anon key cannot read or write any data
-- - The service_role key bypasses RLS (for admin operations)
-- - Direct Postgres connections (like Prisma) bypass RLS
-- - This secures the public API while keeping the app functional
