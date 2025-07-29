-- Create the api_keys table
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(500) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  usage INTEGER DEFAULT 0 NOT NULL,
  monthly_limit INTEGER DEFAULT 1000 NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create an index on the key column for faster lookups
CREATE INDEX idx_api_keys_key ON api_keys(key);

-- Create an index on user_id for faster user-specific queries
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Create an index on created_at for sorting
CREATE INDEX idx_api_keys_created_at ON api_keys(created_at);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_api_key_usage(api_key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE api_keys 
  SET 
    usage = usage + 1,
    last_used = NOW()
  WHERE id = api_key_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Users can only see their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own API keys
CREATE POLICY "Users can insert own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own API keys
CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own API keys
CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- For testing purposes, create a policy that allows all operations without authentication
-- Remove this in production and implement proper authentication
CREATE POLICY "Allow all operations for testing" ON api_keys
  FOR ALL USING (TRUE);

-- Grant necessary permissions
GRANT ALL ON api_keys TO authenticated;
GRANT ALL ON api_keys TO anon; 