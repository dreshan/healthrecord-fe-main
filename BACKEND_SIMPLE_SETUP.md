# Simple Spring Boot Backend Setup

## Step 1: Create Spring Boot Project

Go to [start.spring.io](https://start.spring.io) and configure:

- **Project**: Maven
- **Language**: Java
- **Spring Boot**: 3.2.1
- **Group**: com.healthtrack
- **Artifact**: healthrecordbe
- **Packaging**: Jar
- **Java**: 17

### Add Dependencies:
- Spring Web
- Spring Data JPA
- MySQL Driver
- Lombok

Click **Generate** and extract the ZIP.

---

## Step 2: Project Structure

```
healthrecordbe/
├── src/main/java/com/healthtrack/healthrecordbe/
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── HealthRecordController.java
│   │   ├── PrescriptionController.java
│   │   ├── ConsultationController.java
│   │   ├── PharmacyController.java
│   │   └── UserController.java
│   │
│   ├── entity/
│   │   ├── User.java
│   │   ├── HealthRecord.java
│   │   ├── Prescription.java
│   │   ├── PrescriptionItem.java
│   │   ├── Pharmacy.java
│   │   ├── PharmacyInventory.java
│   │   └── Consultation.java
│   │
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── HealthRecordRepository.java
│   │   ├── PrescriptionRepository.java
│   │   ├── PrescriptionItemRepository.java
│   │   ├── PharmacyRepository.java
│   │   ├── PharmacyInventoryRepository.java
│   │   └── ConsultationRepository.java
│   │
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── HealthRecordService.java
│   │   ├── PrescriptionService.java
│   │   ├── ConsultationService.java
│   │   ├── PharmacyService.java
│   │   └── UserService.java
│   │
│   ├── config/
│   │   └── CorsConfig.java
│   │
│   └── HealthRecordBeApplication.java
│
└── src/main/resources/
    └── application.properties
```

---

## Step 3: Configuration Files

### application.properties

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/healthtrack
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT
jwt.secret=my_secret_key_for_jwt_token_generation_minimum_256_bits_required
jwt.expiration=86400000
```

### pom.xml (Add these to dependencies)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- JWT -->
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

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## Step 4: Database Setup

Create MySQL database:

```sql
CREATE DATABASE healthtrack;
USE healthtrack;
```

Run the SQL from `DATABASE_SCHEMA_MYSQL.md` to create tables.

---

## Step 5: Simple Entity Example

### User.java

```java
package com.healthtrack.healthrecordbe.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "pharmacy_id")
    private String pharmacyId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

## Step 6: Simple Repository Example

### UserRepository.java

```java
package com.healthtrack.healthrecordbe.repository;

import com.healthtrack.healthrecordbe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    boolean existsByEmail(String email);
}
```

---

## Step 7: Simple Service Example

### AuthService.java

```java
package com.healthtrack.healthrecordbe.service;

import com.healthtrack.healthrecordbe.entity.User;
import com.healthtrack.healthrecordbe.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public Map<String, Object> register(Map<String, String> request) {
        // Check if email exists
        if (userRepository.existsByEmail(request.get("email"))) {
            throw new RuntimeException("Email already registered");
        }

        // Create user (in production, hash the password!)
        User user = new User();
        user.setEmail(request.get("email"));
        user.setPassword(request.get("password")); // Hash this in production!
        user.setFullName(request.get("fullName"));
        user.setRole(request.get("role"));
        user.setPhone(request.get("phone"));
        user.setAddress(request.get("address"));
        user.setLicenseNumber(request.get("licenseNumber"));
        user.setPharmacyId(request.get("pharmacyId"));

        user = userRepository.save(user);

        // Generate JWT token
        String token = generateToken(user);

        // Return response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        return response;
    }

    public Map<String, Object> login(Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        // Find user
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // Check password (in production, compare hashed passwords!)
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate JWT token
        String token = generateToken(user);

        // Return response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        return response;
    }

    public User getCurrentUser(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .setSubject(user.getId())
            .claim("role", user.getRole())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
            .compact();
    }

    public String getUserIdFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
```

---

## Step 8: Simple Controller Example

### AuthController.java

```java
package com.healthtrack.healthrecordbe.controller;

import com.healthtrack.healthrecordbe.entity.User;
import com.healthtrack.healthrecordbe.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            Map<String, Object> response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            Map<String, Object> response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = authService.getUserIdFromToken(token);
            User user = authService.getCurrentUser(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
```

---

## Step 9: CORS Configuration

### CorsConfig.java

```java
package com.healthtrack.healthrecordbe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

---

## Step 10: Run the Application

```bash
cd healthrecordbe
./mvnw spring-boot:run
```

Backend will run on: `http://localhost:8080`

---

## Testing the API

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123"
  }'
```

---

## Next Steps

1. Create all other entities (HealthRecord, Prescription, etc.)
2. Create repositories for each entity
3. Create services for business logic
4. Create controllers for each endpoint
5. Follow the same simple pattern

**No complex validation, no Spring Security, just basic JWT authentication and REST endpoints!**

---

## Important Notes

⚠️ **This is a SIMPLE implementation for development:**
- Passwords are NOT hashed (use BCrypt in production!)
- No proper validation (add in production!)
- Simple JWT without Spring Security (add security layer in production!)
- Basic error handling (improve in production!)

✅ **Good for:**
- Learning and development
- Quick prototyping
- Testing frontend integration

---

## Running Both Applications

**Terminal 1 - Backend:**
```bash
cd healthrecordbe
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd healthrecordfe
npm run dev
```

**Terminal 3 - MySQL:**
```bash
mysql -u root -p
```

Done! Both applications running separately and communicating via REST API.
