-- Add wallet_address column to push_subscriptions table
-- This allows us to associate wallet addresses with push notification subscriptions

ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42);

-- Create index for faster wallet address lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_wallet_address 
ON push_subscriptions(wallet_address);

-- Add comment to document the new column
COMMENT ON COLUMN push_subscriptions.wallet_address IS 'Associated wallet address for this push subscription (lowercase)'; 