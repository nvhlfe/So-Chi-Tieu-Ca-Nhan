# Sổ Chi Tiêu — bản độc lập (tự host trên Vercel, dùng Google Gemini miễn phí)

Đây là bản đóng gói lại của dashboard để bạn tự deploy lên Vercel và dùng
bất cứ lúc nào, không cần mở qua Claude. Bản này dùng **Google Gemini API**
(gói miễn phí, không cần thẻ tín dụng) để đọc ảnh thay vì Anthropic.

## Có gì khác so với bản artifact trong chat?

| | Bản trong chat Claude | Bản độc lập này |
|---|---|---|
| Đọc ảnh (OCR) | Claude xử lý sẵn, miễn phí | Gọi Gemini API bằng **API key miễn phí của bạn**, backend nhỏ ở `/api/analyze.js` lo việc này |
| Lưu dữ liệu | Lưu trên tài khoản Claude | Mặc định: `localStorage` trên từng thiết bị. **Tùy chọn:** bật Firebase (Firestore) bên dưới để đồng bộ nhiều thiết bị, miễn phí, không cần đăng nhập |
| Truy cập | Chỉ trong đoạn chat | Mở link bất cứ lúc nào, không cần Claude |
| Chi phí | — | 0đ nếu ở trong hạn mức miễn phí của Gemini (xem bên dưới) |

## Giới hạn miễn phí của Gemini (model `gemini-flash-latest`)

Tính đến giữa 2026: khoảng **15 lượt gọi/phút** và **~1.500 lượt gọi/ngày**, không cần khai báo thẻ.
Với nhu cầu cá nhân (vài chục ảnh mỗi ngày) thì dư sức dùng thoải mái, không tốn tiền.
Lưu ý: Google có thể dùng nội dung bạn gửi ở gói miễn phí để cải thiện mô hình của họ —
nếu bạn thấy nhạy cảm về việc này, có thể bật billing để chuyển sang gói trả phí (rẻ, theo lượng dùng)
để tắt việc đó. Giới hạn chính xác có thể thay đổi theo thời gian, kiểm tra tại
https://ai.google.dev/gemini-api/docs/rate-limits

## Các bước deploy (khoảng 10 phút, không cần biết code)

### 1. Lấy API key miễn phí của Google
1. Vào https://aistudio.google.com/apikey → đăng nhập bằng tài khoản Google
2. Bấm **Create API key** → chọn hoặc tạo 1 Google Cloud project (không cần bật billing)
3. Copy lại key (dạng chuỗi ký tự, không có tiền tố cố định)

### 2. Tạo tài khoản Vercel
1. Vào https://vercel.com → **Sign up** (có thể đăng nhập bằng GitHub cho tiện)

### 3. Đưa project này lên Vercel
Cách dễ nhất nếu bạn không quen dùng dòng lệnh:
1. Tạo 1 repo mới trên GitHub, tải toàn bộ nội dung trong file zip mình gửi lên repo đó (kéo-thả trên giao diện web GitHub cũng được, không cần biết git)
2. Vào Vercel → **Add New → Project** → chọn repo vừa tạo → **Deploy**

Hoặc dùng Vercel CLI nếu bạn quen terminal:
```bash
npm i -g vercel
cd so-chi-tieu-ca-nhan
vercel deploy --prod
```

### 4. Khai báo API key cho Vercel
1. Vào project vừa deploy trên Vercel → **Settings → Environment Variables**
2. Thêm biến: Name = `GEMINI_API_KEY`, Value = key bạn lấy ở bước 1
3. Chọn cả 3 môi trường (Production, Preview, Development) → **Save**
4. Vào tab **Deployments** → bấm **Redeploy** ở lần deploy gần nhất (để biến môi trường có hiệu lực)

### 5. Xong — mở link Vercel cấp cho bạn (dạng `ten-du-an.vercel.app`) và dùng như bình thường.

## Cấu trúc file
```
index.html          → toàn bộ giao diện + logic (giống bản trong chat)
api/analyze.js       → serverless function, giữ Gemini API key an toàn ở server
firebase-config.js   → dán config Firebase vào đây để bật đồng bộ nhiều thiết bị (tùy chọn)
package.json         → khai báo Node runtime cho Vercel
```

## Lưu ý
- Nếu đọc ảnh báo lỗi, mở tab **Deployments → xem Logs** trên Vercel để thấy lỗi thật từ `api/analyze.js` (thường là do chưa set đúng API key, key sai project, hoặc vượt hạn mức miễn phí trong ngày).
- Google đổi/khai tử model Gemini khá thường xuyên (đã từng xảy ra việc 1 model bị khoá đột ngột trước cả ngày công bố chính thức). File `api/analyze.js` đã thử lần lượt vài model (`gemini-flash-latest` → `gemini-2.5-flash` → `gemini-flash-lite-latest`) nên thường sẽ tự "né" được các đợt khai tử mà không cần bạn sửa gì. Nếu cả 3 vẫn lỗi (rất hiếm), nói mình biết để cập nhật danh sách `MODEL_CANDIDATES` sang model mới nhất tại https://ai.google.dev/gemini-api/docs/models

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

