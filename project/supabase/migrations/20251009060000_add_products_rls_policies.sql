-- Migration: Add RLS policies for products table
-- Description: Cho phép admin thực hiện các thao tác CRUD trên bảng products

-- Đảm bảo RLS được bật cho bảng products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy 1: Cho phép tất cả người dùng đọc (SELECT) sản phẩm active
-- First drop the policy if it exists (will cause error if it doesn't exist, but we'll handle that)
DO $$
BEGIN
    BEGIN
        DROP POLICY "Anyone can view active products" ON products;
    EXCEPTION
        WHEN undefined_object THEN
            -- Policy doesn't exist, so we do nothing
    END;
END $$;

-- Then create the new policy
CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
USING (status = 'active' OR auth.role() = 'authenticated');

-- Policy 2: Cho phép admin thêm (INSERT) sản phẩm mới
CREATE POLICY "Admin can insert products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy 3: Cho phép admin cập nhật (UPDATE) sản phẩm
CREATE POLICY "Admin can update products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy 4: Cho phép admin xóa (DELETE) sản phẩm
CREATE POLICY "Admin can delete products"
ON products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Đảm bảo user hiện tại có role admin (thay YOUR_USER_ID bằng ID thực tế)
-- Uncomment và cập nhật dòng dưới nếu cần:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
