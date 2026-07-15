# Sổ Chi Tiêu — bản độc lập (tự host trên Vercel, dùng Google Gemini miễn phí)

Đây là bản đóng gói lại của dashboard để bạn tự deploy lên Vercel và dùng
bất cứ lúc nào, không cần mở qua Claude. Bản này dùng **Google Gemini API**
(gói miễn phí, không cần thẻ tín dụng) để đọc ảnh thay vì Anthropic.

## Có gì khác so với bản artifact trong chat?

| | Bản trong chat Claude | Bản độc lập này |
|---|---|---|
| Đọc ảnh (OCR) | Claude xử lý sẵn, miễn phí | Gọi Gemini API bằng **API key miễn phí của bạn**, backend nhỏ ở `/api/analyze.js` lo việc này |
| Lưu dữ liệu | Lưu trên tài khoản Claude | Lưu bằng `localStorage` **ngay trên trình duyệt/thiết bị đang mở** — đổi máy hoặc xoá cache trình duyệt sẽ mất dữ liệu, không đồng bộ nhiều thiết bị |
| Truy cập | Chỉ trong đoạn chat | Mở link bất cứ lúc nào, không cần Claude |
| Chi phí | — | 0đ nếu ở trong hạn mức miễn phí của Gemini (xem bên dưới) |

## Giới hạn miễn phí của Gemini (model `gemini-2.5-flash`)

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
index.html         → toàn bộ giao diện + logic (giống bản trong chat)
api/analyze.js      → serverless function, giữ API key an toàn ở server, gọi Gemini hộ trình duyệt
package.json        → khai báo Node runtime cho Vercel
```

## Lưu ý
- Dữ liệu lưu trong `localStorage` của từng trình duyệt/thiết bị — nếu muốn xem trên nhiều thiết bị, dùng chức năng **Xuất Excel** để backup, hoặc nói mình biết để nâng cấp lên lưu trữ đám mây thật (cần thêm 1 database, ví dụ Vercel KV hoặc Supabase).
- Nếu đọc ảnh báo lỗi, mở tab **Deployments → xem Logs** trên Vercel để thấy lỗi thật từ `api/analyze.js` (thường là do chưa set đúng API key, key sai project, hoặc vượt hạn mức miễn phí trong ngày).
- Nếu sau này Google đổi tên model `gemini-2.5-flash` (các hãng AI hay cập nhật model mới), chỉ cần sửa 1 dòng `const MODEL = ...` trong `api/analyze.js`.
