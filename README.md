# NewSky English - Hướng dẫn cài đặt

## Cấu trúc dự án
```
newskyenglish/
├── backend/    → Spring Boot (deploy: Render)
└── frontend/   → React.js  (deploy: Vercel)
```

---

## BACKEND (Spring Boot)

### 1. Cấu hình Aiven Database
Mở file `backend/src/main/resources/application.properties`, điền thông tin từ Aiven Console:

```properties
spring.datasource.url=jdbc:postgresql://<HOST>:<PORT>/<DATABASE>?sslmode=require
spring.datasource.username=<USERNAME>
spring.datasource.password=<PASSWORD>
```

### 2. Chạy local
```bash
cd backend
mvn spring-boot:run
```
API chạy tại: http://localhost:8080

### 3. Deploy lên Render
Thêm Environment Variables trong Render dashboard:
- `DATABASE_URL` = jdbc:postgresql://...?sslmode=require
- `DATABASE_USERNAME` = avnadmin
- `DATABASE_PASSWORD` = your_password
- `SPRING_PROFILES_ACTIVE` = render

Build command: `mvn clean package -DskipTests`
Start command: `java -jar target/newskyenglish-backend-0.0.1-SNAPSHOT.jar`

---

## API ENDPOINTS

| Method | URL | Mô tả |
|--------|-----|-------|
| GET    | /users     | Lấy tất cả users |
| GET    | /users/:id | Lấy user theo ID |
| POST   | /users     | Tạo user mới |
| PUT    | /users/:id | Cập nhật user |
| DELETE | /users/:id | Xóa user |

---

## FRONTEND (React)

### 1. Cài đặt
```bash
cd frontend
npm install
```

### 2. Chạy local
```bash
npm start
```
Mở: http://localhost:3000

### 3. Deploy lên Vercel
- Push code lên GitHub
- Kết nối repo với Vercel
- Thêm Environment Variable: `REACT_APP_API_URL=https://nhom5-newskyenglish.onrender.com`
- Deploy!
