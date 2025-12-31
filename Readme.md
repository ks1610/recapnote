<h1>Crisp Recap Note Tool</h1>

Crisp Recap Note là công cụ cho Fontline giúp tạo tóm tắt đoạn hội thoại, công cụ sử dụng trự tiếp API của Gemini, có thể tóm tắt những diễn biến của cuộc hội thoại trong vòng một ca làm việc của Fontline, công cụ này có thể được sử dụng để nắm bắt được diễn biến của ca trước đó hoặc sử dụng để tạo recap note khi kết thúc ca làm

[![Xem video demo](/recap/image.png)](/recap/crispsummary.mp4)

<h2>Các tính năng chính:</h2>
<li>Tự động tóm tắt: Quét nội dung tin nhắn trong phiên làm việc (hoặc 3h15' gần nhất).</li>
<li>Chỉ lấy nội dung mới sau lần Recap cuối cùng.</li>
<li>Chuẩn hóa Status: Tự động xác định trạng thái:</li>
- fixed: đã được khắc phục.<br>
- ww for response: Đang chờ khách trả lời.<br>
- cw for dev: Đã chuyển kỹ thuật/Dev kiểm tra.

<h2>Hướng dẫn sử dụng tool</h2>

<h3>Bước 1: Lấy API của Gemini</h3>
Để công cụ hoạt động, bạn cần một chìa khóa (API Key) từ Google. Nó hoàn toàn miễn phí.
<li>Truy cập: <a herf= https://aistudio.google.com/api-keys>Google AI Studio.</a></li>
<li>Đăng nhập bằng tài khoản Google (Gmail) của bạn.
</li>
<li>Nhấn vào nút Create API key.</li>
<li>Chọn Create API key in new project.</li>
<li>Copy đoạn mã bắt đầu bằng AIza... đó lại.</li>

<h3>Bước 2: Cấu hình Extension</h3>

Trước khi cài đặt, bạn cần dán API Key vừa lấy vào code:
<li>Mở thư mục chứa code của tool.</li>
<li>Chuột phải vào file <strong>popup.js</strong>, chọn Open with Notepad (hoặc VS Code).</li>
<li>Tìm dòng đầu tiên trong hàm callGeminiAPI:
</li>

```javascript
const API_KEY = "PUT_YOUR_API_HERE"; // Dán API Key của bạn vào đây
```

<h3>Bước 3: Cài đặt lên trình duyệt</h3>
Công cụ này chưa có trên Store, bạn cần cài đặt thủ công (Sideload) như sau:
<li>Ở trong Browser > chọn Extension > chọn Manage Extension.</li>
<li>Bật công tắc Developer mode ở góc trên bên phải.</li>
<li>Nhấn nút Load unpacked.</li>
<li>Chọn thư mục chứa code.</li>

<h3>Bước 4: Sử dụng công cụ</h3>

<li>Truy cập trang chat Crisp.</li>
<li>Mở một cuộc hội thoại với khách hàng.
</li>
<li>Nhấn vào biểu tượng Extension trên thanh công cụ trình duyệt.</li>
<li>Nhấn nút Get Summary, đợi khoảng 2-3 giây để AI phân tích.
</li>
<li>Nhấn nút Copy Result (màu xanh lá) hiện ra bên dưới.</li>
<li>Dán (Paste) vào phần Private Note trên Crisp</li>

<h2>Lưu ý quan trọng</h2>

<li><strong>Bảo mật:</strong> Không chia sẻ file popup.js chứa API Key của bạn cho người lạ.</li>
<li><strong>Lỗi không chạy:</strong> Nếu bấm nút mà không thấy gì, hãy thử F5 lại trang Crisp hoặc kiểm tra xem bạn đã dán đúng API Key chưa.</li>
<li><strong>Hạn mức:</strong> Key miễn phí của Google cho phép gọi rất nhiều lần trong ngày, thoải mái cho nhu cầu Support cá nhân.</li>














