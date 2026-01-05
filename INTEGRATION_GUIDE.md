# Integration Guide: React Frontend + Spring Boot Backend

This guide walks you through connecting your React frontend with Spring Boot backend using MySQL and JWT authentication.

---

## Overview

- **Frontend**: React + TypeScript + Vite (Port 5173)
- **Backend**: Spring Boot + JPA + MySQL (Port 8080)
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)

---

## Step 1: Setup MySQL Database

### 1.1 Install MySQL

If not already installed:
```bash
# macOS
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql

# Windows
# Download from: https://dev.mysql.com/downloads/installer/
```

### 1.2 Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE healthtrack;
USE healthtrack;
```

### 1.3 Run Database Schema

Execute the SQL from `DATABASE_SCHEMA_MYSQL.md`:

```sql
-- Copy and paste all SQL from DATABASE_SCHEMA_MYSQL.md
-- This will create all 7 tables:
-- users, health_records, prescriptions, prescription_items,
-- consultations, pharmacies, pharmacy_inventory
```

---

## Step 2: Create Spring Boot Backend

### 2.1 Generate Project

Go to [start.spring.io](https://start.spring.io) and configure:

- **Project**: Maven
- **Language**: Java
- **Spring Boot**: 3.2.1
- **Group**: com.healthtrack
- **Artifact**: healthrecordbe
- **Packaging**: Jar
- **Java**: 17

**Dependencies to add**:
- Spring Web
- Spring Data JPA
- MySQL Driver
- Lombok

Click **Generate** and extract the ZIP to a folder named `healthrecordbe`.

### 2.2 Configure Application

Edit `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/healthtrack
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Configuration
jwt.secret=my_secret_key_for_jwt_token_generation_minimum_256_bits_required
jwt.expiration=86400000
```

Update `username` and `password` to match your MySQL credentials.

### 2.3 Add JWT Dependency

Edit `pom.xml` and add these dependencies inside `<dependencies>`:

```xml
<!-- JWT Dependencies -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

### 2.4 Create Project Structure

```
healthrecordbe/src/main/java/com/healthtrack/healthrecordbe/
├── config/
│   └── CorsConfig.java
├── entity/
│   ├── User.java
│   ├── HealthRecord.java
│   ├── Prescription.java
│   ├── PrescriptionItem.java
│   ├── Consultation.java
│   ├── Pharmacy.java
│   └── PharmacyInventory.java
├── repository/
│   ├── UserRepository.java
│   ├── HealthRecordRepository.java
│   ├── PrescriptionRepository.java
│   ├── PrescriptionItemRepository.java
│   ├── ConsultationRepository.java
│   ├── PharmacyRepository.java
│   └── PharmacyInventoryRepository.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── HealthRecordService.java
│   ├── PrescriptionService.java
│   ├── ConsultationService.java
│   └── PharmacyService.java
└── controller/
    ├── AuthController.java
    ├── UserController.java
    ├── HealthRecordController.java
    ├── PrescriptionController.java
    ├── ConsultationController.java
    └── PharmacyController.java
```

### 2.5 Implement Core Files

Refer to these files for complete code examples:
- **BACKEND_SIMPLE_SETUP.md** - Setup guide with basic examples
- **BACKEND_EXAMPLES.md** - All entity, service, and controller code

**Start with these essential files**:

1. **CorsConfig.java** - Enable CORS for React frontend
2. **User.java** - User entity
3. **UserRepository.java** - User repository
4. **AuthService.java** - JWT authentication logic
5. **AuthController.java** - Auth endpoints

Copy the complete code from `BACKEND_SIMPLE_SETUP.md`.

---

## Step 3: Run Spring Boot Backend

```bash
cd healthrecordbe
./mvnw spring-boot:run
```

Backend will start on: **http://localhost:8080**

### Test Backend

```bash
# Register a user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "patient"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123"
  }'
```

You should receive a JWT token in the response.

---

## Step 4: Setup React Frontend

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Configure Environment

The `.env` file is already configured:

```env
# API Base URL - Point to your Spring Boot backend
VITE_API_BASE_URL=http://localhost:8080/api
```

If backend runs on a different port, update the URL.

### 4.3 Verify API Configuration

The frontend is already configured to work with Spring Boot:

**src/services/api.ts**:
- Sends `Authorization: Bearer <token>` header
- Connects to `http://localhost:8080/api`
- Handles JWT token storage

**src/services/authService.ts**:
- Login: `POST /auth/login`
- Register: `POST /auth/register`
- Get user: `GET /auth/me`

### 4.4 Run Frontend

```bash
npm run dev
```

Frontend will start on: **http://localhost:5173**

---

## Step 5: Running Everything Together

You need **3 terminals**:

### Terminal 1: MySQL Database
```bash
mysql -u root -p
USE healthtrack;
```

### Terminal 2: Spring Boot Backend
```bash
cd healthrecordbe
./mvnw spring-boot:run
```
Wait until you see: `Started HealthRecordBeApplication in X.XXX seconds`

### Terminal 3: React Frontend
```bash
cd healthrecordfe
npm run dev
```

Open browser: **http://localhost:5173**

---

## Step 6: Testing the Integration

### 6.1 Register a New User

1. Open **http://localhost:5173**
2. Click **Register**
3. Fill in:
   - Email: `patient@test.com`
   - Password: `password123`
   - Full Name: `John Doe`
   - Role: `patient`
4. Click **Register**

### 6.2 Login

1. Use the credentials you just created
2. You should be redirected to the dashboard

### 6.3 Verify Backend Connection

Check Terminal 2 (Spring Boot logs). You should see:
```
Hibernate: select user0_.id as id1_... from users user0_ where user0_.email=?
```

This confirms the frontend is communicating with the backend.

---

## Step 7: API Endpoints Overview

All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Health Records
- `GET /api/health-records` - Get user's health records
- `POST /api/health-records` - Create new health record
- `PUT /api/health-records/{id}` - Update health record
- `DELETE /api/health-records/{id}` - Delete health record

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/{id}` - Update prescription
- `GET /api/prescription-items` - Get prescription items

### Consultations
- `GET /api/consultations` - Get consultations
- `POST /api/consultations` - Create consultation
- `PUT /api/consultations/{id}/reply` - Reply to consultation

### Users
- `GET /api/users/patients` - Get all patients
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users/{id}` - Get user by ID

### Pharmacy
- `GET /api/pharmacies` - Get all pharmacies
- `GET /api/pharmacy-inventory` - Get pharmacy inventory
- `PUT /api/pharmacy-inventory/{id}` - Update inventory

Full API specification: `SPRING_BOOT_API_SPECIFICATION.md`

---

## Troubleshooting

### Backend won't start

**Error**: `Cannot connect to MySQL`
```bash
# Check MySQL is running
mysql -u root -p

# Check credentials in application.properties match
```

**Error**: `Port 8080 already in use`
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

### Frontend can't connect to backend

**Error**: `Failed to fetch`
```bash
# Verify backend is running
curl http://localhost:8080/api/auth/login

# Check CORS configuration in CorsConfig.java
# Verify .env has correct VITE_API_BASE_URL
```

### CORS errors in browser console

Add to `CorsConfig.java`:
```java
registry.addMapping("/**")
    .allowedOrigins("http://localhost:5173")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    .allowedHeaders("*")
    .allowCredentials(true);
```

### JWT token issues

**Error**: `Invalid token`
```bash
# Check jwt.secret in application.properties is at least 256 bits
# Verify token is being sent in Authorization header
# Check token hasn't expired
```

---

## Production Deployment

For production, update these:

### Backend (application.properties)
```properties
# Change to production database
spring.datasource.url=jdbc:mysql://production-host:3306/healthtrack

# Use environment variable for secrets
jwt.secret=${JWT_SECRET}

# Disable SQL logging
spring.jpa.show-sql=false
```

### Frontend (.env)
```env
# Point to production backend
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Security Improvements
1. Add password hashing (BCrypt) in AuthService
2. Add request validation
3. Implement rate limiting
4. Add HTTPS/SSL
5. Use environment variables for secrets

---

## Project Files Reference

| File | Description |
|------|-------------|
| `BACKEND_SIMPLE_SETUP.md` | Complete Spring Boot setup guide |
| `BACKEND_EXAMPLES.md` | Entity, Service, Controller code examples |
| `DATABASE_SCHEMA_MYSQL.md` | Complete MySQL database schema |
| `SPRING_BOOT_API_SPECIFICATION.md` | Full API endpoint documentation |
| `SEPARATION_GUIDE.md` | Guide for separating frontend/backend |

---

## Quick Command Reference

```bash
# Start MySQL
mysql -u root -p

# Start Backend
cd healthrecordbe && ./mvnw spring-boot:run

# Start Frontend
cd healthrecordfe && npm run dev

# Build Frontend for Production
npm run build

# Test Backend API
curl http://localhost:8080/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

---

## Next Steps

1. Implement remaining controllers (Prescription, Consultation, Pharmacy)
2. Add form validation in frontend
3. Implement file upload for health records
4. Add error handling and loading states
5. Write unit tests
6. Add password hashing in backend
7. Implement refresh tokens
8. Add role-based access control

---

## Support

If you encounter issues:
1. Check all 3 services are running (MySQL, Backend, Frontend)
2. Verify database connection in MySQL Workbench
3. Check backend logs in Terminal 2
4. Check browser console for frontend errors
5. Test API endpoints with curl or Postman

For detailed code examples, see `BACKEND_EXAMPLES.md`.
