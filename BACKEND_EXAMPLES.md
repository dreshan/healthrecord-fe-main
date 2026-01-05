# Spring Boot Backend - More Examples

## HealthRecord Entity

```java
package com.healthtrack.healthrecordbe.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_records")
@Data
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "record_type", nullable = false)
    private String recordType;

    @Column(name = "file_url")
    private String fileUrl;

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

## HealthRecordRepository

```java
package com.healthtrack.healthrecordbe.repository;

import com.healthtrack.healthrecordbe.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, String> {
    List<HealthRecord> findByPatientId(String patientId);
}
```

## HealthRecordService

```java
package com.healthtrack.healthrecordbe.service;

import com.healthtrack.healthrecordbe.entity.HealthRecord;
import com.healthtrack.healthrecordbe.repository.HealthRecordRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;

    public List<HealthRecord> getRecordsByPatientId(String patientId) {
        return healthRecordRepository.findByPatientId(patientId);
    }

    public HealthRecord getRecordById(String id) {
        return healthRecordRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Record not found"));
    }

    public HealthRecord createRecord(String patientId, Map<String, String> request) {
        HealthRecord record = new HealthRecord();
        record.setPatientId(patientId);
        record.setTitle(request.get("title"));
        record.setDescription(request.get("description"));
        record.setRecordType(request.get("recordType"));
        record.setFileUrl(request.get("fileUrl"));

        return healthRecordRepository.save(record);
    }

    public HealthRecord updateRecord(String id, Map<String, String> request) {
        HealthRecord record = getRecordById(id);

        if (request.containsKey("title")) {
            record.setTitle(request.get("title"));
        }
        if (request.containsKey("description")) {
            record.setDescription(request.get("description"));
        }

        return healthRecordRepository.save(record);
    }

    public void deleteRecord(String id) {
        healthRecordRepository.deleteById(id);
    }
}
```

## HealthRecordController

```java
package com.healthtrack.healthrecordbe.controller;

import com.healthtrack.healthrecordbe.entity.HealthRecord;
import com.healthtrack.healthrecordbe.service.AuthService;
import com.healthtrack.healthrecordbe.service.HealthRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-records")
@RequiredArgsConstructor
public class HealthRecordController {

    private final HealthRecordService healthRecordService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<HealthRecord>> getMyRecords(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = authService.getUserIdFromToken(token);
            List<HealthRecord> records = healthRecordService.getRecordsByPatientId(userId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthRecord> getRecordById(@PathVariable String id) {
        try {
            HealthRecord record = healthRecordService.getRecordById(id);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<HealthRecord> createRecord(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = authService.getUserIdFromToken(token);
            HealthRecord record = healthRecordService.createRecord(userId, request);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HealthRecord> updateRecord(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            HealthRecord record = healthRecordService.updateRecord(id, request);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable String id) {
        try {
            healthRecordService.deleteRecord(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}
```

---

## Prescription Entity

```java
package com.healthtrack.healthrecordbe.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(nullable = false)
    private String status = "pending";

    @Column(name = "issued_date")
    private LocalDateTime issuedDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "prescriptionId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrescriptionItem> items;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        issuedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

## PrescriptionItem Entity

```java
package com.healthtrack.healthrecordbe.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescription_items")
@Data
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "prescription_id", nullable = false)
    private String prescriptionId;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String dosage;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private String frequency;

    @Column(nullable = false)
    private String duration;

    @Column(name = "pharmacy_id")
    private String pharmacyId;

    @Column(name = "fulfilled_by_pharmacy")
    private String fulfilledByPharmacy;

    @Column(name = "fulfilled_at")
    private LocalDateTime fulfilledAt;

    @Column(nullable = false)
    private String status = "pending";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

---

## UserService (for doctors/patients list)

```java
package com.healthtrack.healthrecordbe.service;

import com.healthtrack.healthrecordbe.entity.User;
import com.healthtrack.healthrecordbe.repository.UserRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllPatients() {
        return userRepository.findByRole("patient");
    }

    public List<User> getAllDoctors() {
        return userRepository.findByRole("doctor");
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
```

## UserController

```java
package com.healthtrack.healthrecordbe.controller;

import com.healthtrack.healthrecordbe.entity.User;
import com.healthtrack.healthrecordbe.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/patients")
    public ResponseEntity<List<User>> getAllPatients() {
        List<User> patients = userService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<User>> getAllDoctors() {
        List<User> doctors = userService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
}
```

---

## Consultation Entity

```java
package com.healthtrack.healthrecordbe.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@Data
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(columnDefinition = "TEXT")
    private String reply;

    @Column(nullable = false)
    private String status = "pending";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

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

## Pharmacy Entity

```java
package com.healthtrack.healthrecordbe.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "pharmacies")
@Data
public class Pharmacy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    private String phone;

    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

## PharmacyInventory Entity

```java
package com.healthtrack.healthrecordbe.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pharmacy_inventory")
@Data
public class PharmacyInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "pharmacy_id", nullable = false)
    private String pharmacyId;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
```

---

## Quick Implementation Checklist

For each entity, follow this pattern:

1. ✅ Create Entity class with `@Entity` and `@Table`
2. ✅ Create Repository interface extending `JpaRepository`
3. ✅ Create Service class with `@Service` and business logic
4. ✅ Create Controller class with `@RestController` and endpoints
5. ✅ Add CORS configuration
6. ✅ Test with curl or Postman

**That's it! Keep it simple, no complex validation or security.**

---

## Running Everything

```bash
# Terminal 1 - MySQL
mysql -u root -p
CREATE DATABASE healthtrack;

# Terminal 2 - Backend
cd healthrecordbe
./mvnw spring-boot:run

# Terminal 3 - Frontend
cd healthrecordfe
npm run dev
```

✅ Frontend: http://localhost:5173
✅ Backend: http://localhost:8080
✅ Database: localhost:3306/healthtrack

Done!
