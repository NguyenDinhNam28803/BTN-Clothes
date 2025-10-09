# Hướng dẫn cài đặt 

Hướng dẫn này sẽ giúp các thành viên trong team cài đặt và sử dụng Supabase cho dự án BTN-Clothes, bao gồm cả môi trường local development và môi trường trực tuyến (cloud).

## Nội dung
- [Phần 1: Cài đặt và sử dụng Supabase Local](#yêu-cầu-hệ-thống)
- [Phần 2: Triển khai và sử dụng Supabase trực tuyến](#triển-khai-supabase-lên-môi-trường-trực-tuyến-cloud)

## Yêu cầu hệ thống

1. **Docker Desktop** - Cài đặt từ [Docker.com](https://www.docker.com/products/docker-desktop/)
2. **Git** - Để clone repository
3. **Node.js** - Phiên bản 18+ và npm/pnpm/yarn
4. **Supabase CLI** - Công cụ dòng lệnh của Supabase

## Cài đặt Supabase CLI

### Windows

```powershell
# Sử dụng PowerShell
iwr -useb https://get.supabase.com/install.ps1 | iex
```

### macOS và Linux

```bash
# Sử dụng Terminal
curl -s https://get.supabase.com/install.sh | bash
```

Hoặc cài đặt qua npm:

```bash
npm install -g supabase
```

## Clone repository và cài đặt dependencies

```bash
# Clone repository
git clone https://github.com/NguyenDinhNam28803/BTN-Clothes.git
cd BTN-Clothes/project

# Cài đặt dependencies
npm install
```

## Khởi động Supabase Local

Đảm bảo Docker Desktop đã chạy, sau đó:

```bash
# Khởi động Supabase local
npx supabase start
```

Quá trình này có thể mất vài phút khi chạy lần đầu vì Docker cần tải về các images. Sau khi hoàn tất, bạn sẽ thấy thông tin như sau:

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        JWT secret: xxx
          anon key: xxx
     service_role key: xxx
```

Lưu lại các thông tin này để cấu hình trong file môi trường của dự án.

## Cấu hình môi trường

Tạo file `.env.local` trong thư mục gốc của dự án với nội dung sau (thay thế các giá trị bằng thông tin Supabase của bạn):

```
# Môi trường local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJh...Điền anon key ở đây

# Nếu sử dụng môi trường trực tuyến, hãy sử dụng cấu hình sau thay thế
# VITE_SUPABASE_URL=https://your-project-ref.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Chạy migrations để tạo database schema

```bash
# Chạy tất cả migrations
npx supabase db reset
```

Lệnh này sẽ áp dụng tất cả các migrations trong thư mục `supabase/migrations`.

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy ở địa chỉ `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng).

## Tài khoản Admin mặc định

Sau khi cài đặt, bạn có thể đăng nhập bằng tài khoản admin:

- Email: admin@btnclothes.com
- Password: admin123

## Thao tác với Supabase

### Truy cập Supabase Studio

Mở trình duyệt và truy cập `http://localhost:54323` để sử dụng Supabase Studio - giao diện quản trị trực quan cho database.

### Tạo migration mới

Khi bạn thay đổi cấu trúc database, hãy tạo migration mới:

```bash
# Tạo migration mới
npx supabase migration new tên_migration
```

File migration mới sẽ được tạo trong thư mục `supabase/migrations` với timestamp hiện tại.

### Áp dụng migration cụ thể

```bash
# Áp dụng một migration cụ thể
npx supabase db push tên_file_migration.sql
```

### Dừng Supabase Local

Khi không cần sử dụng nữa:

```bash
npx supabase stop
```

## Xử lý sự cố

### Reset lại database

Nếu bạn muốn reset lại toàn bộ database:

```bash
npx supabase db reset
```

Lưu ý: Lệnh này sẽ xóa tất cả dữ liệu hiện tại và áp dụng lại các migrations.

### Docker không khởi động được

Kiểm tra Docker Desktop đã chạy chưa, đảm bảo không có xung đột port (54321-54324). Có thể cần khởi động lại Docker hoặc máy tính.

### Lỗi khi chạy migrations

Kiểm tra lỗi cú pháp SQL trong các file migration. Sử dụng Supabase Studio để chạy các câu lệnh SQL một cách thủ công để debug.

## Triển khai Supabase lên môi trường trực tuyến (cloud)

Thay vì sử dụng Supabase local, bạn có thể triển khai lên môi trường cloud của Supabase để tất cả thành viên có thể truy cập mà không cần cài đặt local.

### 1. Đăng ký tài khoản Supabase

Truy cập [supabase.com](https://supabase.com/) và đăng ký tài khoản miễn phí.

### 2. Tạo dự án mới

1. Từ dashboard, click vào "New Project"
2. Chọn tên dự án (ví dụ: "btn-clothes-production")
3. Đặt mật khẩu cho database
4. Chọn region gần nhất với người dùng (ví dụ: Asia Southeast)
5. Click "Create new project"

### 3. Cấu hình dự án trực tuyến

Sau khi dự án được tạo (mất khoảng 2-3 phút):

1. Vào phần "Settings" > "API" để lấy URL và API Key
2. Cập nhật file `.env` của dự án với thông tin từ môi trường trực tuyến:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Triển khai database schema

Có hai cách để triển khai schema lên môi trường trực tuyến:

#### Cách 1: Sử dụng Supabase CLI

```bash
# Đăng nhập vào Supabase CLI
npx supabase login

# Liên kết project local với project trực tuyến
npx supabase link --project-ref your-project-ref

# Đẩy migrations lên môi trường trực tuyến
npx supabase db push
```

#### Cách 2: Sử dụng SQL Editor trong Supabase Dashboard

1. Truy cập vào dự án trên [app.supabase.com](https://app.supabase.com)
2. Chọn "SQL Editor" trong menu
3. Copy nội dung từ các file migration trong thư mục `supabase/migrations`
4. Paste vào SQL Editor và chạy theo đúng thứ tự các file migration

### 5. Chia sẻ thông tin truy cập cho team

Chia sẻ thông tin URL và API key cho các thành viên trong team để họ có thể kết nối đến cùng một database trực tuyến:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Quản lý người dùng và dữ liệu

- Truy cập "Authentication" để quản lý người dùng
- Truy cập "Table Editor" để xem và chỉnh sửa dữ liệu
- Truy cập "SQL Editor" để chạy các câu lệnh SQL trực tiếp

### Lưu ý bảo mật

- KHÔNG bao giờ chia sẻ service_role key, chỉ chia sẻ anon key
- Đảm bảo đã cấu hình Row Level Security (RLS) đúng cách
- Xem xét thiết lập các quy tắc bảo mật phù hợp trong Supabase Dashboard

## Thông tin thêm

- [Tài liệu chính thức của Supabase](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Hướng dẫn triển khai trực tuyến](https://supabase.com/docs/guides/platform/migrating-and-upgrading)
