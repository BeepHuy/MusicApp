# 🎵 Music App — Giai đoạn 1, Tuần 1
## Hướng dẫn tích hợp code mới

### Những gì đã thay đổi

| File cũ | File mới | Thay đổi |
|---------|----------|----------|
| `app.js` (1 file chứa tất cả) | `js/player.js` | Module xử lý phát nhạc |
| | `js/ui.js` | Module render giao diện từ data |
| | `js/search.js` | Module tìm kiếm realtime |
| | `js/app.js` | File khởi tạo chính |
| Dữ liệu hardcode trong HTML + JS | `data/songs.json` | Dữ liệu tách riêng, sạch sẽ |
| `index.html` (HTML cứng) | `index.html` | HTML nhẹ, JS render nội dung |
| `week.html` (HTML cứng) | `week.html` | Tương tự |

### Cách tích hợp

1. **Backup** project hiện tại:
   ```bash
   cp -r music-app.github.io music-app-backup
   ```

2. **Tạo thư mục mới**:
   ```bash
   mkdir -p data js
   ```

3. **Copy các file mới** vào project:
   - Copy `data/songs.json` → `data/songs.json`
   - Copy `js/player.js`, `js/ui.js`, `js/search.js`, `js/app.js` → `js/`
   - Thay thế `index.html` và `week.html`

4. **Xóa file cũ**:
   - Xóa `app.js` ở thư mục gốc (đã chuyển vào `js/`)

5. **Giữ nguyên**:
   - Thư mục `css/` (style.css, week.css) — không đổi
   - Thư mục `img/` — không đổi
   - Thư mục `audio/` — không đổi
   - File `vande.mp3` — có thể giữ hoặc xóa

### Cấu trúc sau khi tích hợp

```
music-app.github.io/
├── index.html          ← MỚI
├── week.html           ← MỚI
├── data/
│   └── songs.json      ← MỚI (dữ liệu)
├── js/
│   ├── app.js          ← MỚI (khởi tạo)
│   ├── player.js       ← MỚI (player logic)
│   ├── ui.js           ← MỚI (render UI)
│   └── search.js       ← MỚI (tìm kiếm)
├── css/
│   ├── style.css       (giữ nguyên)
│   └── week.css        (giữ nguyên)
├── img/                (giữ nguyên)
│   ├── 0.png ... 28.png
│   ├── backimg.png
│   ├── logo.png
│   └── week.png
└── audio/              (giữ nguyên)
    ├── 1.mp3 ... 28.mp3
```

### Tính năng mới so với bản cũ

- ✅ **Dữ liệu tách riêng**: thêm/sửa/xóa bài hát chỉ cần sửa `songs.json`
- ✅ **Tìm kiếm realtime**: gõ vào ô search để lọc bài hát ngay lập tức
- ✅ **Click cả dòng**: click vào bất kỳ đâu trên dòng bài hát đều phát nhạc
- ✅ **Restart thông minh**: bấm Previous khi đang nghe > 3 giây → quay lại đầu bài
- ✅ **Code module hóa**: dễ bảo trì, mở rộng từng phần

### Bước tiếp theo (Tuần 2)

- Thêm shuffle, repeat (one/all)
- Thanh progress kéo được mượt hơn
- Lưu trạng thái vào localStorage
- Cải thiện responsive cho mobile
