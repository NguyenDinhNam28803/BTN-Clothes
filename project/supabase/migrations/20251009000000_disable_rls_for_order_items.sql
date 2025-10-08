-- Add INSERT policy for order_items table to fix checkout process
CREATE POLICY "Enable insert for authenticated users" ON order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;