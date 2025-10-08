# BTN Clothes - Admin Access

## 🔐 Tài Khoản Admin

### Tài khoản test (tạo thủ công):
- **Email**: admin@btnclothes.com
- **Password**: Admin123!

### Hướng dẫn tạo tài khoản admin:

1. **Đăng ký tài khoản mới**:
   - Truy cập `/login` hoặc `/register`
   - Click "Sign Up"
   - Điền thông tin:
     - Full Name: Admin BTN
     - Email: admin@btnclothes.com
     - Password: Admin123!
   - Click "Create Account"

2. **Đăng nhập**:
   - Email: admin@btnclothes.com
   - Password: Admin123!

3. **Truy cập Admin Panel**:
   - Sau khi đăng nhập, truy cập: `/admin`
   - Hoặc từ menu user dropdown chọn "Admin" (nếu có quyền)

## 📋 Tính Năng Đã Hoàn Thành

### ✅ Authentication & Authorization
- Sign up / Sign in với Supabase
- Session management
- Protected routes
- User dropdown menu trong header

### ✅ Shop Page - HOẠT ĐỘNG ĐẦY ĐỦ
- ✅ Load products từ database
- ✅ Search sản phẩm (real-time)
- ✅ Filter theo category (Men, Women, Kids, Accessories)
- ✅ Filter theo price range (slider)
- ✅ Sort (Featured, Price ascending/descending, Newest)
- ✅ Grid / List view toggle
- ✅ Add to Cart (working)
- ✅ Add to Wishlist (working)
- ✅ Toast notifications
- ✅ Loading skeleton
- ✅ Empty state

### ✅ Cart & Wishlist Context
- Quản lý state với React Context
- LocalStorage persistence khi chưa login
- Sync với Supabase khi đã login
- Real-time count trong header

### ✅ Database
- 12 tables với RLS policies
- Sample data (8 products, 15 variants, 5 vouchers)
- Categories: Men, Women, Kids, Accessories

## 🚧 Cần Hoàn Thiện

### Product Detail Page
- Load product từ database theo ID
- Connect Add to Cart button
- Connect Add to Wishlist button
- Load variants (size, color)
- Load reviews

### Cart Page
- Hiển thị items từ CartContext
- Update quantity
- Remove items
- Apply voucher
- Calculate shipping

### Wishlist Page
- Hiển thị items từ WishlistContext
- Remove items
- Move to cart

### Checkout
- Validate address
- Process order
- Save to database

### Admin Panel
- CRUD operations cho products
- Order management
- Customer management

## 🎨 Design Features

- ✅ Loading screen với progress bar
- ✅ Custom cursor system
- ✅ AOS animations
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Gradient backgrounds theo từng trang
- ✅ Hover effects & transitions

## 📦 Sample Products

Database đã có 8 sản phẩm mẫu:
1. Premium Cotton Shirt - $34.99 (was $49.99)
2. Designer Jeans - $62.99 (was $89.99)
3. Leather Jacket - $149.99 (was $199.99)
4. Summer Dress - $69.99
5. Casual T-Shirt - $19.99 (was $24.99)
6. Formal Blazer - $149.99
7. Midi Skirt - $38.49 (was $54.99)
8. Kids Hoodie - $24.99 (was $34.99)

## 🧪 Test Features

1. **Search**: Nhập "shirt" hoặc "dress" vào search box
2. **Filter**: Click radio button categories
3. **Sort**: Chọn sort options
4. **Add to Cart**: Click "Add to Cart" button (toast sẽ hiện)
5. **Wishlist**: Click heart icon (chuyển màu đỏ)
6. **View Count**: Check header badge count updates

## 📱 Responsive

- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1366px, 1440px, 1920px
 
 Nam ngu