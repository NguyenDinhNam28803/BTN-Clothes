-- Migration: Set admin role for users
-- Description: Cập nhật role admin cho user để có quyền quản lý sản phẩm

-- Cách 1: Set admin role cho user đầu tiên trong hệ thống
UPDATE users 
SET role = 'admin' 
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- Cách 2: Set admin role cho user theo email cụ thể
-- Uncomment và thay đổi email nếu bạn muốn dùng cách này:
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

-- Kiểm tra kết quả
-- SELECT id, email, role FROM users WHERE role = 'admin';
