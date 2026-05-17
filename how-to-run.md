# 🚀 Hướng dẫn chạy Yonsei Pulse

Dự án sử dụng **React Native + Expo**. Bạn không cần giả lập (emulator) — chỉ cần cài Expo Go trên điện thoại và scan QR là xong.

---

## 📋 Yêu cầu

| Công cụ | Phiên bản khuyến nghị |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Expo Go (điện thoại) | Phiên bản mới nhất |

> **Expo Go** — Tải về tại [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS) hoặc [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android).

---

## ⚙️ Cài đặt & Chạy

### 🪟 Windows

```powershell
# 1. Clone dự án
git clone https://github.com/NguyendatGH/Yonsei-Pulse.git
cd Yonsei-Pulse

# 2. Cài dependencies
npm install

# 3. Khởi chạy Expo
npx expo start
```

### 🐧 Ubuntu / Linux

```bash
# 1. Clone dự án
git clone https://github.com/NguyendatGH/Yonsei-Pulse.git
cd Yonsei-Pulse

# 2. Cài dependencies
npm install

# 3. Khởi chạy Expo
npx expo start
```

---

## 📱 Xem trên điện thoại (scan QR)

Sau khi chạy `npx expo start`, terminal sẽ hiển thị một **mã QR**.

```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █  █ ▄ █   <-- QR xuất hiện ở đây
█ █   █ █▀▄ █▀▄█
█ █▄▄▄█ █▀▀ █▀▄█
█▄▄▄▄▄▄▄█▄▀▄█▄▄█

› Web is waiting on http://localhost:8081
```

### Cách scan:

| Hệ điều hành | Cách mở |
|---|---|
| **Android** | Mở app **Expo Go** → nhấn **"Scan QR code"** → scan QR trên terminal |
| **iOS** | Mở **Camera** → quét QR → nhấn thông báo để mở Expo Go |

> ⚠️ **Lưu ý:** Máy tính và điện thoại phải **cùng kết nối một mạng Wi-Fi**.

---

## 🌐 Xem trên trình duyệt (Web)

Nếu muốn chạy nhanh trên trình duyệt mà không cần điện thoại:

```bash
npx expo start --web
```

Sau đó truy cập **http://localhost:8081** trên trình duyệt.

---

## 🛠️ Xử lý lỗi thường gặp

**Lỗi: `Unable to resolve module`**
```bash
npm install
npx expo start --clear
```

**Lỗi: `Network response timed out` khi scan QR**
- Kiểm tra máy tính và điện thoại có cùng mạng Wi-Fi không.
- Thử chuyển sang tunnel mode: `npx expo start --tunnel`

**Lỗi trên Ubuntu: `ENOSPC: System limit for number of file watchers reached`**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📂 Cấu trúc chính

```
Yonsei-Pulse/
├── app/              # Màn hình (Expo Router - file-based routing)
│   ├── (tabs)/       # 4 tab chính: Trang chủ, Học tập, Thống kê, Hồ sơ
│   └── practice/     # Màn hình luyện tập (Dictation, Flashcard, SRS...)
├── components/       # UI components tái sử dụng
├── db/               # SQLite local database (repos + seed)
├── hooks/            # Custom React hooks
└── constants/        # Theme, mock data
```

---

Made with ❤️ by Yonsei Pulse Team
