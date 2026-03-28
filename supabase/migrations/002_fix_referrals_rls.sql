-- Migration: Fix referrals RLS policy
-- CRITICAL: PII (name, contact) must NOT be publicly readable

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view referrals" ON referrals;

-- Create a restrictive SELECT policy: only authenticated service role can view all referrals
-- This prevents public exposure of PII while allowing admin access via service_role
CREATE POLICY "Service role only can view referrals" ON referrals
  FOR SELECT USING (auth.role() = 'service_role');

-- Note: INSERT policy "Anyone can insert referrals" remains as-is (users need to submit referrals)
-- The key fix is that no one can SELECT public PII data
