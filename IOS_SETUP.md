# Hướng dẫn cấu hình & Chạy LocalGo Vietnam trên Điện thoại iOS (iPhone)

Tài liệu này hướng dẫn chi tiết cách cấu hình, chạy thử nghiệm và đóng gói ứng dụng di động **LocalGo Vietnam** trên hệ điều hành **iOS (iPhone / iPad)** khi phát triển từ máy tính **Windows**.

---

## 📌 1. Thực tế môi trường phát triển & Giải pháp cho iOS

- **Máy tính hiện tại**: Windows 11 (Địa chỉ IP mạng nội bộ LAN: `192.168.10.148`).
- **Đặc thù của iOS**: Apple yêu cầu hệ điều hành macOS và phần mềm Xcode để biên dịch ứng dụng native `.ipa` hoặc chạy iOS Simulator cục bộ.
- **Giải pháp tối ưu trên Windows**:
  1. **Chạy ngay qua ứng dụng Expo Go (Khuyên dùng để test nhanh - Miễn phí 100%)**:
     - Cài app **Expo Go** từ App Store trên iPhone.
     - Quét mã QR từ màn hình máy tính để xem app chạy trực tiếp trên iPhone.
  2. **Build bản Native qua EAS Cloud Build (Dành cho Production / TestFlight)**:
     - Dùng dịch vụ đám mây của Expo (EAS Build) - Expo sẽ biên dịch app trên cụm máy chủ macOS của họ.
     - Tải file về cài lên iPhone thông qua link Internal Distribution hoặc Apple TestFlight.

---

## 🛠️ 2. Các thành phần đã được cấu hình sẵn trong dự án

Hệ thống đã tự động hoàn thiện toàn bộ các thiết lập cần thiết cho iOS:

1. **Assets & Icons**:
   - Đã sinh đầy đủ các file icon và splash chuẩn cho iOS tại `mobile/assets/images/`:
     - `icon.png` (App Icon)
     - `splash.png` (Màn hình khởi động dark theme)
     - `adaptive-icon.png`
     - `favicon.png`
     - `notification-icon.png`
2. **Cấu hình Firebase iOS**:
   - Đã tạo `mobile/GoogleService-Info.plist` (với Bundle ID: `com.localgo.vietnam`).
   - Đã tạo `mobile/google-services.json` cho Android đồng bộ.
3. **Cấu hình Quyền riêng tư (Permissions) trên iOS**:
   - Đã khai báo đầy đủ các quyền trong `mobile/app.json` (`infoPlist`):
     - `NSLocationWhenInUseUsageDescription`: Định vị tìm điểm du lịch lân cận.
     - `NSCameraUsageDescription`: Chụp ảnh check-in và quét mã QR.
     - `NSPhotoLibraryUsageDescription`: Chọn ảnh tải lên bài viết cộng đồng / review.
     - `NSMicrophoneUsageDescription`: Ghi âm/quay video review.
     - `UIBackgroundModes`: Nhận thông báo Push Notifications.
     - `itsAppUsesNonExemptEncryption`: false (tránh lỗi khai báo mã hóa khi đẩy TestFlight).
4. **Kết nối mạng & Backend**:
   - File `mobile/.env` đã được cấu hình IP LAN: `EXPO_PUBLIC_API_URL=http://192.168.10.148:5000/api/v1` (giúp iPhone khi bắt cùng Wi-Fi kết nối thẳng vào Backend trên PC).
   - Backend `backend/.env` đã được thêm IP LAN vào danh sách CORS hợp lệ.
5. **Màn hình phụ & Fallback**:
   - Đã bổ sung `mobile/app/(auth)/email-login.tsx` có chức năng đăng nhập trải nghiệm nội bộ.
   - Đã bổ sung các màn hình: `settings.tsx`, `checkin/[id].tsx`, `journal/[id].tsx`.

---

## 🚀 3. Hướng dẫn chạy thử nghiệm ngay trên iPhone (Expo Go)

### Bước 1: Khởi động Backend (Node.js API)
Mở một cửa sổ Terminal (PowerShell):
```bash
cd backend
npm.cmd run dev
```
*Đảm bảo server hiển thị cổng 5000 đang lắng nghe.*

### Bước 2: Khởi động ứng dụng Mobile (Expo Metro)
Mở một cửa sổ Terminal thứ hai:
```bash
cd mobile
npx expo start --tunnel
```
> **Mẹo quan trọng**: Cờ `--tunnel` giúp kết nối iPhone và máy tính thông qua đường hầm an toàn của Expo, hoạt động ngay cả khi mạng Wi-Fi công ty/nhà có tường lửa chặn kết nối giữa các thiết bị nội bộ hoặc khi điện thoại dùng 4G/5G.

### Bước 3: Mở trên iPhone
1. Vào **App Store** trên iPhone, tìm và tải ứng dụng **Expo Go**.
2. Mở ứng dụng **Camera** trên iPhone và hướng ống kính vào mã QR trên màn hình Terminal của máy tính.
3. Nhấn vào thông báo màu vàng hiện ra: *"Mở trong Expo Go"*.
4. Ứng dụng sẽ tải mã JavaScript và hiển thị toàn bộ giao diện LocalGo Vietnam!

---

## 📦 4. Hướng dẫn Build file cài đặt Native cho iOS (EAS Build)

Khi bạn muốn đóng gói app thành bản cài đặt chính thức hoặc đưa lên **Apple TestFlight**:

### Bước 1: Cài đặt EAS CLI & Đăng nhập
```bash
npm.cmd install -g eas-cli
eas login
```
*(Nếu chưa có tài khoản, đăng ký miễn phí tại [expo.dev](https://expo.dev)).*

### Bước 2: Liên kết Project với Expo EAS
Trong thư mục `mobile`:
```bash
cd mobile
eas init
```
*(Hệ thống sẽ tạo projectId và tự động điền vào `app.json`).*

### Bước 3: Thay thế file Firebase thật (Nếu dùng Google Sign-in / Push Notification thật)
1. Vào [Firebase Console](https://console.firebase.google.com/).
2. Chọn dự án của bạn -> Nhấn **Add App** -> Chọn icon **iOS**.
3. Điền **Apple bundle ID**: `com.localgo.vietnam`.
4. Tải file `GoogleService-Info.plist` về và chép đè vào thư mục `mobile/GoogleService-Info.plist`.

### Bước 4: Chạy lệnh Build trên Cloud
- **Build bản xem trước (Ad-hoc / Simulator)**:
  ```bash
  # Dành cho iPhone thật (yêu cầu tài khoản Apple Developer để đăng ký thiết bị):
  eas build --platform ios --profile preview

  # Hoặc build cho iOS Simulator:
  eas build --platform ios --profile preview-simulator
  ```
- **Build bản Production (đưa lên App Store / TestFlight)**:
  ```bash
  eas build --platform ios --profile production
  ```
  EAS sẽ tự động biên dịch trên máy chủ macOS trên cloud và cung cấp link tải/QR code hoặc tự động đẩy lên App Store Connect.

---

## ❓ 5. Xử lý các vấn đề thường gặp

| Hiện tượng | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| Không quét được mã QR / Lỗi kết nối | iPhone và PC không nhìn thấy nhau do Wi-Fi chặn IP nội bộ | Chạy `npx expo start --tunnel` thay vì `npx expo start`. |
| Lỗi API `Network Error` | iPhone không kết nối được `http://localhost:5000` | Mở `mobile/.env`, kiểm tra IP máy tính `192.168.10.148` hoặc dùng link backend đã deploy (Render/Railway). |
| Bị văng ở màn hình đăng nhập Google trên Expo Go | Expo Go không hỗ trợ binary native Firebase Google Sign-In | Bấm chọn **"Tiếp tục với tư cách khách"** hoặc **"Đăng nhập bằng Email"** để vào ngay ứng dụng. Bản Google Sign-in cần build qua EAS development client. |
