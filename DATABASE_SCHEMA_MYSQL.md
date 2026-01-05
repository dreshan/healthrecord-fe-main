# MySQL Database Schema for Health Record Tracker

## Overview
This document provides the complete MySQL database schema for the Health Record Tracker system. Use this to create your database tables in Spring Boot with JPA/Hibernate.

---

## Database Creation

```sql
CREATE DATABASE healthtrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healthtrack;
```

---

## Tables

### 1. users

Stores user account information for all roles (patients, doctors, pharmacists).

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'pharmacist') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    license_number VARCHAR(100),
    pharmacy_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_pharmacy_id (pharmacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Columns:**
- `id`: Primary key (UUID)
- `email`: User's email (unique)
- `password`: Hashed password (BCrypt)
- `full_name`: User's full name
- `role`: User role (patient, doctor, or pharmacist)
- `phone`: Contact phone number (optional)
- `address`: Address (optional)
- `license_number`: Doctor's license number (optional, for doctors only)
- `pharmacy_id`: Associated pharmacy ID (optional, for pharmacists only)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

---

### 2. health_records

Stores patient health records and medical documents.

```sql
CREATE TABLE health_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    record_type ENUM('lab_report', 'prescription', 'medical_history', 'vaccination') NOT NULL,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_record_type (record_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Columns:**
- `id`: Primary key (UUID)
- `patient_id`: Reference to user (patient)
- `title`: Record title
- `description`: Record description (optional)
- `record_type`: Type of record (lab_report, prescription, medical_history, vaccination)
- `file_url`: URL to file storage (optional)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

### 3. pharmacies

Stores pharmacy information.

```sql
CREATE TABLE pharmacies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Columns:**
- `id`: Primary key (UUID)
- `name`: Pharmacy name
- `address`: Pharmacy address
- `phone`: Contact phone (optional)
- `email`: Contact email (optional)
- `created_at`: Record creation timestamp

---

### 4. prescriptions

Stores prescription information issued by doctors.

```sql
CREATE TABLE prescriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    diagnosis TEXT NOT NULL,
    instructions TEXT,
    status ENUM('pending', 'fulfilled', 'partially_fulfilled', 'cancelled') DEFAULT 'pending',
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_issued_date (issued_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Columns:**
- `id`: Primary key (UUID)
- `doctor_id`: Reference to user (doctor)
- `patient_id`: Reference to user (patient)
- `diagnosis`: Medical diagnosis
- `instructions`: Additional instructions (optional)
- `status`: Prescription status (pending, fulfilled, partially_fulfilled, cancelled)
- `issued_date`: When prescription was issued
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

### 5. prescription_items

Stores individual medicines in a prescription.

```sql
CREATE TABLE prescription_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    prescription_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    pharmacy_id VARCHAR(36),
    fulfilled_by_pharmacy VARCHAR(36),
    fulfilled_at TIMESTAMP NULL,
    status ENUM('pending', 'fulfilled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL,
    FOREIGN KEY (fulfilled_by_pharmacy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_prescription_id (prescription_id),
    INDEX idx_status (status),
    INDEX idx_pharmacy_id (pharmacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Columns:**
- `id`: Primary key (UUID)
- `prescription_id`: Reference to prescription
- `medicine_name`: Name of medicine
- `dosage`: Medicine dosage (e.g., "500mg")
- `quantity`: Quantity prescribed
- `frequency`: How often to take (e.g., "Twice daily")
- `duration`: Treatment duration (e.g., "7 days")
- `pharmacy_id`: Pharmacy that fulfilled this item (optional)
- `fulfilled_by_pharmacy`: Pharmacist user who fulfilled (optional)
- `fulfilled_at`: When item was fulfilled (optional)
- `status`: Item status (pending or fulfilled)
- `created_at`: Record creation timestamp

---

### 6. pharmacy_inventory

Stores available medicines at each pharmacy.

```sql
CREATE TABLE pharmacy_inventory (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pharmacy_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pharmacy_medicine (pharmacy_id, medicine_name),
    INDEX idx_pharmacy_id (pharmacy_id),
    INDEX idx_medicine_name (medicine_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Columns:**
- `id`: Primary key (UUID)
- `pharmacy_id`: Reference to pharmacy
- `medicine_name`: Name of medicine
- `quantity`: Available quantity
- `unit_price`: Price per unit (optional)
- `last_updated`: Last update timestamp

**Constraints:**
- Unique constraint on (pharmacy_id, medicine_name) to prevent duplicates

---

### 7. consultations

Stores consultation requests between patients and doctors.

```sql
CREATE TABLE consultations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reply TEXT,
    status ENUM('pending', 'replied', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replied_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Columns:**
- `id`: Primary key (UUID)
- `doctor_id`: Reference to user (doctor)
- `patient_id`: Reference to user (patient)
- `subject`: Consultation subject
- `message`: Patient's message
- `reply`: Doctor's reply (optional)
- `status`: Consultation status (pending, replied, closed)
- `created_at`: When consultation was created
- `replied_at`: When doctor replied (optional)
- `updated_at`: Last update timestamp

---

## Complete Schema SQL Script

Here's the complete script to create all tables:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS healthtrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healthtrack;

-- 1. Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'pharmacist') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    license_number VARCHAR(100),
    pharmacy_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_pharmacy_id (pharmacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Pharmacies table
CREATE TABLE pharmacies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Health records table
CREATE TABLE health_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    record_type ENUM('lab_report', 'prescription', 'medical_history', 'vaccination') NOT NULL,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_record_type (record_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Prescriptions table
CREATE TABLE prescriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    diagnosis TEXT NOT NULL,
    instructions TEXT,
    status ENUM('pending', 'fulfilled', 'partially_fulfilled', 'cancelled') DEFAULT 'pending',
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_issued_date (issued_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Prescription items table
CREATE TABLE prescription_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    prescription_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    pharmacy_id VARCHAR(36),
    fulfilled_by_pharmacy VARCHAR(36),
    fulfilled_at TIMESTAMP NULL,
    status ENUM('pending', 'fulfilled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL,
    FOREIGN KEY (fulfilled_by_pharmacy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_prescription_id (prescription_id),
    INDEX idx_status (status),
    INDEX idx_pharmacy_id (pharmacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Pharmacy inventory table
CREATE TABLE pharmacy_inventory (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pharmacy_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pharmacy_medicine (pharmacy_id, medicine_name),
    INDEX idx_pharmacy_id (pharmacy_id),
    INDEX idx_medicine_name (medicine_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Consultations table
CREATE TABLE consultations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reply TEXT,
    status ENUM('pending', 'replied', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replied_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for users.pharmacy_id
ALTER TABLE users
ADD CONSTRAINT fk_users_pharmacy
FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
```

---

## Sample Data (Optional)

For testing purposes, you can insert sample data:

```sql
-- Insert sample pharmacies
INSERT INTO pharmacies (id, name, address, phone, email) VALUES
(UUID(), 'City Medical Pharmacy', '123 Main Street, Downtown', '555-0101', 'city@pharmacy.com'),
(UUID(), 'Health Plus Pharmacy', '456 Oak Avenue, Uptown', '555-0102', 'health@pharmacy.com'),
(UUID(), 'Care First Pharmacy', '789 Pine Road, Suburb', '555-0103', 'care@pharmacy.com');

-- Note: Users should be created through the registration endpoint
-- Passwords must be hashed using BCrypt before insertion
```

---

## JPA Entity Mapping Guide

### User Entity Example

```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "pharmacy_id")
    private String pharmacyId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

public enum UserRole {
    patient, doctor, pharmacist
}
```

---

## Database Relationships

```
users (1) -----> (N) health_records
users (1) -----> (N) prescriptions (as doctor)
users (1) -----> (N) prescriptions (as patient)
users (1) -----> (N) consultations (as doctor)
users (1) -----> (N) consultations (as patient)

pharmacies (1) -----> (N) users (pharmacists)
pharmacies (1) -----> (N) pharmacy_inventory
pharmacies (1) -----> (N) prescription_items

prescriptions (1) -----> (N) prescription_items
```

---

## Indexing Strategy

The schema includes indexes on:
- Foreign keys for join performance
- Email for user lookups
- Role for role-based queries
- Status fields for filtering
- Date fields for sorting and range queries
- Medicine names for search

---

## Data Integrity

- **CASCADE DELETE**: When a user is deleted, their related records are deleted
- **SET NULL**: When a pharmacy is deleted, references are set to NULL
- **UNIQUE constraints**: Prevent duplicate entries (email, pharmacy+medicine)

---

## Security Considerations

1. **Password Storage**: Always hash passwords using BCrypt before storing
2. **SQL Injection**: Use prepared statements/JPA to prevent SQL injection
3. **Access Control**: Implement role-based access at application level
4. **Data Privacy**: Users should only access their own data
5. **Audit Trail**: created_at and updated_at provide basic auditing

---

## Performance Optimization

1. All foreign keys are indexed
2. Frequently queried fields have indexes
3. Use InnoDB engine for ACID compliance
4. Consider partitioning tables as data grows
5. Regularly analyze and optimize queries

---

## Migration from Supabase

If you have existing data in Supabase (PostgreSQL), you'll need to:

1. Export data from Supabase
2. Convert PostgreSQL-specific features to MySQL equivalents
3. Map UUID types appropriately
4. Handle timezone differences in timestamps
5. Import data into MySQL

---

## Notes

- All IDs use UUID format (VARCHAR(36))
- All timestamps use TIMESTAMP type with automatic updates where needed
- Character set is utf8mb4 for full Unicode support (including emojis)
- Foreign keys ensure referential integrity
- Indexes improve query performance
- ENUM types constrain values to valid options
