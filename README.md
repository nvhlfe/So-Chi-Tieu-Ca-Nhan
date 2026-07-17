# Sổ Chi Tiêu — bản độc lập (tự host trên Vercel)

Đây là bản đóng gói lại của dashboard để bạn tự deploy lên Vercel và dùng
bất cứ lúc nào, không cần mở qua Claude. Bản này **không dùng AI để đọc ảnh**
(đã bỏ, vì độ chính xác không ổn định) — bạn thêm giao dịch bằng cách dán
nguyên văn tin nhắn ngân hàng hoặc nhập tay. Nhờ vậy, bản này **không cần
API key, không cần backend, không tốn phí AI nào cả** — chỉ còn Firebase
(tùy chọn) nếu bạn muốn đồng bộ nhiều thiết bị.

## Có gì khác so với bản artifact trong chat?

| | Bản trong chat Claude | Bản độc lập này |
|---|---|---|
| Thêm giao dịch | Dán tin nhắn, nhập tay, hoặc chụp ảnh (Claude đọc hộ) | Dán tin nhắn hoặc nhập tay (không có chụp ảnh) |
| Lưu dữ liệu | Lưu trên tài khoản Claude | Mặc định: `localStorage` trên từng thiết bị. **Tùy chọn:** bật Firebase (Firestore) bên dưới để đồng bộ nhiều thiết bị, miễn phí, không cần đăng nhập |
| Truy cập | Chỉ trong đoạn chat | Mở link bất cứ lúc nào, không cần Claude |
| Chi phí | — | 0đ, không cần API key nào |

## Các bước deploy (khoảng 5 phút, không cần biết code)

### 1. Tạo tài khoản Vercel
Vào https://vercel.com → **Sign up** (có thể đăng nhập bằng GitHub cho tiện)

### 2. Đưa project này lên Vercel
Cách dễ nhất nếu bạn không quen dùng dòng lệnh:
1. Tạo 1 repo mới trên GitHub, tải toàn bộ nội dung trong file zip mình gửi lên repo đó (kéo-thả trên giao diện web GitHub cũng được, không cần biết git)
2. Vào Vercel → **Add New → Project** → chọn repo vừa tạo → **Deploy**

Hoặc dùng Vercel CLI nếu bạn quen terminal:
```bash
npm i -g vercel
cd so-chi-tieu-ca-nhan
vercel deploy --prod
```

### 3. Xong — mở link Vercel cấp cho bạn (dạng `ten-du-an.vercel.app`) và dùng như bình thường.

Không có bước cấu hình biến môi trường nào cả — vì không còn gọi AI, chỉ cần deploy là chạy.

## Cấu trúc file
```
index.html          → toàn bộ giao diện + logic (giống bản trong chat, trừ phần đọc ảnh)
firebase-config.js   → dán config Firebase vào đây để bật đồng bộ nhiều thiết bị (tùy chọn)
package.json         → khai báo project cho Vercel
```

## Cách thêm giao dịch
- **Dán tin nhắn**: copy nguyên văn tin nhắn SMS/thông báo ngân hàng, dán vào ô trong app, bấm "Phân tích" — dán được nhiều tin cùng lúc. Mỗi dòng kết quả có 2 ô chọn: **Thẻ** và **Danh mục** — sửa lại nếu app đoán sai, hoặc chọn "+ Thêm thẻ mới…" / "+ Thêm danh mục mới…" để tạo mới ngay tại chỗ.
- **Nhập tay**: chuyển sang tab "Nhập tay" trong khung thêm giao dịch, điền ngày/giờ/nội dung/số tiền, chọn **Thẻ** và **Danh mục** (hoặc tạo mới bằng "+ Thêm thẻ mới…" / "+ Thêm danh mục mới…") rồi bấm "Thêm giao dịch" — form tự để trống lại để bạn nhập tiếp giao dịch kế tiếp nhanh hơn.
- Thẻ/danh mục tự tạo sẽ xuất hiện luôn trong các lần thêm sau, và đồng bộ qua các thiết bị khác nếu bạn đã bật Firebase.

---

## (Tùy chọn) Đồng bộ nhiều thiết bị bằng Firebase — không cần đăng nhập

Mặc định app lưu dữ liệu bằng `localStorage` (mỗi thiết bị/trình duyệt riêng biệt).
Làm theo các bước dưới đây nếu bạn muốn mở trên điện thoại **và** máy tính, thấy cùng 1 dữ liệu.

### Cách hoạt động (và đánh đổi cần biết)
Vì bạn không muốn có màn hình đăng nhập, app dùng một **"mã đồng bộ"** — một chuỗi ký tự dài, ngẫu nhiên, tự sinh ra ở lần mở đầu tiên. Bất kỳ thiết bị nào nhập đúng mã này sẽ xem/sửa được đúng dữ liệu đó. Về bản chất nó giống một "link chia sẻ riêng tư" — không ai đoán được mã đó (đủ dài để không thể dò), nhưng **ai có mã thì có toàn quyền**, nên:
- Đừng dán mã này vào nơi công khai (chat công khai, mạng xã hội...)
- Coi mã này như mật khẩu

### Bước 1: Tạo project Firebase (miễn phí, không cần thẻ)
1. Vào https://console.firebase.google.com → **Add project** → đặt tên tuỳ ý → tắt Google Analytics cho gọn (không cần) → **Create**
2. Trong project, vào **Build → Firestore Database** → **Create database** → chọn chế độ **Production mode** → chọn khu vực gần bạn (vd `asia-southeast1`) → **Enable**

### Bước 2: Thiết lập Security Rules
Vào tab **Rules** trong Firestore, thay toàn bộ nội dung bằng:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /boards/{boardId} {
      allow read, write: if boardId.size() >= 20;
    }
  }
}
```
Rule này cho phép đọc/ghi 1 "board" cụ thể nếu biết đúng mã (≥20 ký tự — mã app tự sinh dài hơn nhiều nên luôn qua được điều kiện này), nhưng **không cho liệt kê danh sách các board** — người khác không thể "dò" ra dữ liệu của bạn nếu không có đúng mã. Bấm **Publish**.

### Bước 3: Lấy config và dán vào project
1. Vào **Project settings** (biểu tượng bánh răng) → cuộn xuống **Your apps** → bấm biểu tượng **`</>`** (Web) → đặt tên app tuỳ ý → **Register app** (không cần Firebase Hosting)
2. Copy đoạn `firebaseConfig = {...}` hiện ra
3. Mở file `firebase-config.js` trong project, dán đè lên phần `PASTE_...`

### Bước 4: Deploy lại
Đưa code (đã sửa `firebase-config.js`) lên lại Vercel như bình thường (git push hoặc `vercel deploy --prod`). Không cần thêm Environment Variable nào cho Firebase — config này được phép để thẳng trong code frontend.

### Bước 5: Liên kết các thiết bị
1. Mở app trên thiết bị đầu tiên → vào **Quản lý dữ liệu** (icon thùng rác) → sẽ thấy mục "Đồng bộ nhiều thiết bị: đang bật" kèm 1 mã → bấm **Sao chép**
2. Mở app trên thiết bị thứ hai (lần đầu mở, thiết bị này sẽ tự sinh mã riêng của nó) → vào **Quản lý dữ liệu** → dán mã vừa copy vào ô **Liên kết** → bấm **Liên kết**
3. Từ giờ 2 thiết bị dùng chung 1 dữ liệu, cập nhật gần như tức thời

Muốn ngừng đồng bộ trên 1 thiết bị (quay lại lưu riêng cục bộ), vào **Quản lý dữ liệu → Ngắt đồng bộ trên máy này** — dữ liệu trên đám mây không bị xoá, chỉ máy đó thôi liên kết.
