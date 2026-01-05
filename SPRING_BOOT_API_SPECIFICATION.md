# Spring Boot Backend API Specification

## Overview
This document specifies all REST API endpoints required for the Health Record Tracker system. The frontend is already built and expects these exact endpoints.

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require JWT authentication.

**Authorization Header:**
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "patient",  // "patient" | "doctor" | "pharmacist"
  "phone": "1234567890",  // optional
  "address": "123 Main St",  // optional
  "licenseNumber": "LIC123",  // optional, for doctors
  "pharmacyId": "uuid"  // optional, for pharmacists
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "patient",
    "phone": "1234567890",
    "address": "123 Main St",
    "licenseNumber": null,
    "pharmacyId": null,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### POST /api/auth/login
Authenticate user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "patient",
    "phone": "1234567890",
    "address": "123 Main St",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### GET /api/auth/me
Get current authenticated user

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "patient",
  "phone": "1234567890",
  "address": "123 Main St",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

## 2. User Endpoints

### GET /api/users/patients
Get all patients (accessible by doctors)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "patient@example.com",
    "fullName": "Jane Patient",
    "role": "patient",
    "phone": "1234567890",
    "address": "123 Main St",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

### GET /api/users/doctors
Get all doctors (accessible by patients)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "doctor@example.com",
    "fullName": "Dr. Smith",
    "role": "doctor",
    "licenseNumber": "LIC123",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

### GET /api/users/{id}
Get user by ID

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "patient",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### PUT /api/users/profile
Update current user's profile

**Request Body:**
```json
{
  "fullName": "John Updated",
  "phone": "9876543210",
  "address": "456 New St"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Updated",
  "role": "patient",
  "phone": "9876543210",
  "address": "456 New St",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

---

## 3. Health Records Endpoints

### GET /api/health-records
Get current user's health records

**Response (200):**
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "title": "Blood Test Results",
    "description": "Uploaded on 01/01/2025",
    "recordType": "lab_report",
    "fileUrl": null,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

### GET /api/health-records/{id}
Get specific health record

**Response (200):**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "title": "Blood Test Results",
  "description": "Uploaded on 01/01/2025",
  "recordType": "lab_report",
  "fileUrl": null,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### POST /api/health-records
Create new health record

**Request Body:**
```json
{
  "title": "Blood Test Results",
  "description": "Annual checkup",
  "recordType": "lab_report",  // "lab_report" | "prescription" | "medical_history" | "vaccination"
  "fileUrl": "https://example.com/file.pdf"  // optional
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "title": "Blood Test Results",
  "description": "Annual checkup",
  "recordType": "lab_report",
  "fileUrl": "https://example.com/file.pdf",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### PUT /api/health-records/{id}
Update health record

**Request Body:**
```json
{
  "title": "Updated Blood Test",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "title": "Updated Blood Test",
  "description": "Updated description",
  "recordType": "lab_report",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

### DELETE /api/health-records/{id}
Delete health record

**Response (204):** No content

---

## 4. Prescription Endpoints

### GET /api/prescriptions
Get prescriptions for current user (patients see theirs, doctors see ones they issued)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "doctorId": "uuid",
    "patientId": "uuid",
    "diagnosis": "Common Cold",
    "instructions": "Rest and drink fluids",
    "status": "pending",  // "pending" | "fulfilled" | "partially_fulfilled" | "cancelled"
    "issuedDate": "2025-01-01T00:00:00Z",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "items": [
      {
        "id": "uuid",
        "prescriptionId": "uuid",
        "medicineName": "Paracetamol",
        "dosage": "500mg",
        "quantity": 10,
        "frequency": "Twice daily",
        "duration": "5 days",
        "pharmacyId": null,
        "fulfilledByPharmacy": null,
        "fulfilledAt": null,
        "status": "pending",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "doctor": {
      "id": "uuid",
      "fullName": "Dr. Smith",
      "email": "doctor@example.com"
    },
    "patient": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "patient@example.com"
    }
  }
]
```

### GET /api/prescriptions/{id}
Get specific prescription with items

**Response (200):**
```json
{
  "id": "uuid",
  "doctorId": "uuid",
  "patientId": "uuid",
  "diagnosis": "Common Cold",
  "instructions": "Rest and drink fluids",
  "status": "pending",
  "issuedDate": "2025-01-01T00:00:00Z",
  "items": [...],
  "doctor": {...},
  "patient": {...}
}
```

### POST /api/prescriptions
Create new prescription (doctors only)

**Request Body:**
```json
{
  "patientId": "uuid",
  "diagnosis": "Common Cold",
  "instructions": "Rest and drink fluids",
  "items": [
    {
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "quantity": 10,
      "frequency": "Twice daily",
      "duration": "5 days"
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "doctorId": "uuid",
  "patientId": "uuid",
  "diagnosis": "Common Cold",
  "instructions": "Rest and drink fluids",
  "status": "pending",
  "issuedDate": "2025-01-01T00:00:00Z",
  "items": [...]
}
```

### PUT /api/prescriptions/{id}/status
Update prescription status

**Request Body:**
```json
{
  "status": "fulfilled"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "fulfilled",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

### GET /api/prescriptions/{prescriptionId}/items
Get items for specific prescription

**Response (200):**
```json
[
  {
    "id": "uuid",
    "prescriptionId": "uuid",
    "medicineName": "Paracetamol",
    "dosage": "500mg",
    "quantity": 10,
    "frequency": "Twice daily",
    "duration": "5 days",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### GET /api/prescription-items
Get all prescription items (pharmacists use this)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "prescriptionId": "uuid",
    "medicineName": "Paracetamol",
    "dosage": "500mg",
    "quantity": 10,
    "frequency": "Twice daily",
    "duration": "5 days",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00Z",
    "prescriptions": {
      "id": "uuid",
      "diagnosis": "Common Cold",
      "doctor": {...},
      "patient": {...}
    }
  }
]
```

### PUT /api/prescription-items/{itemId}/fulfill
Fulfill prescription item (pharmacists only)

**Request Body:**
```json
{
  "pharmacyId": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "prescriptionId": "uuid",
  "medicineName": "Paracetamol",
  "status": "fulfilled",
  "pharmacyId": "uuid",
  "fulfilledByPharmacy": "uuid",
  "fulfilledAt": "2025-01-01T12:00:00Z"
}
```

---

## 5. Consultation Endpoints

### GET /api/consultations
Get consultations for current user

**Response (200):**
```json
[
  {
    "id": "uuid",
    "doctorId": "uuid",
    "patientId": "uuid",
    "subject": "Headache Consultation",
    "message": "I have been experiencing headaches...",
    "reply": null,
    "status": "pending",  // "pending" | "replied" | "closed"
    "createdAt": "2025-01-01T00:00:00Z",
    "repliedAt": null,
    "updatedAt": "2025-01-01T00:00:00Z",
    "doctor": {
      "id": "uuid",
      "fullName": "Dr. Smith",
      "email": "doctor@example.com"
    },
    "patient": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "patient@example.com"
    }
  }
]
```

### GET /api/consultations/{id}
Get specific consultation

**Response (200):**
```json
{
  "id": "uuid",
  "doctorId": "uuid",
  "patientId": "uuid",
  "subject": "Headache Consultation",
  "message": "I have been experiencing headaches...",
  "reply": "Please take rest and drink water...",
  "status": "replied",
  "createdAt": "2025-01-01T00:00:00Z",
  "repliedAt": "2025-01-01T12:00:00Z",
  "doctor": {...},
  "patient": {...}
}
```

### POST /api/consultations
Create consultation (patients only)

**Request Body:**
```json
{
  "doctorId": "uuid",
  "subject": "Headache Consultation",
  "message": "I have been experiencing headaches for 3 days..."
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "doctorId": "uuid",
  "patientId": "uuid",
  "subject": "Headache Consultation",
  "message": "I have been experiencing headaches...",
  "status": "pending",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PUT /api/consultations/{id}/reply
Reply to consultation (doctors only)

**Request Body:**
```json
{
  "reply": "Please take rest and drink plenty of water. If symptoms persist, visit the clinic."
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "reply": "Please take rest...",
  "status": "replied",
  "repliedAt": "2025-01-01T12:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

### PUT /api/consultations/{id}/close
Close consultation

**Response (200):**
```json
{
  "id": "uuid",
  "status": "closed",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

---

## 6. Pharmacy Endpoints

### GET /api/pharmacies
Get all pharmacies

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "City Pharmacy",
    "address": "123 Main St, City",
    "phone": "1234567890",
    "email": "city@pharmacy.com",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### GET /api/pharmacies/{id}
Get specific pharmacy

**Response (200):**
```json
{
  "id": "uuid",
  "name": "City Pharmacy",
  "address": "123 Main St, City",
  "phone": "1234567890",
  "email": "city@pharmacy.com",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### GET /api/pharmacies/{pharmacyId}/inventory
Get pharmacy inventory

**Response (200):**
```json
[
  {
    "id": "uuid",
    "pharmacyId": "uuid",
    "medicineName": "Paracetamol",
    "quantity": 100,
    "unitPrice": 5.50,
    "lastUpdated": "2025-01-01T00:00:00Z"
  }
]
```

### GET /api/pharmacies/{pharmacyId}/inventory/search?name={medicineName}
Search medicines in pharmacy

**Response (200):**
```json
[
  {
    "id": "uuid",
    "pharmacyId": "uuid",
    "medicineName": "Paracetamol",
    "quantity": 100,
    "unitPrice": 5.50,
    "lastUpdated": "2025-01-01T00:00:00Z"
  }
]
```

### POST /api/pharmacies/{pharmacyId}/inventory
Add medicine to inventory (pharmacists only)

**Request Body:**
```json
{
  "medicineName": "Paracetamol",
  "quantity": 100,
  "unitPrice": 5.50
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "pharmacyId": "uuid",
  "medicineName": "Paracetamol",
  "quantity": 100,
  "unitPrice": 5.50,
  "lastUpdated": "2025-01-01T00:00:00Z"
}
```

### PUT /api/pharmacies/{pharmacyId}/inventory/{itemId}
Update inventory item (pharmacists only)

**Request Body:**
```json
{
  "quantity": 150,
  "unitPrice": 6.00
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "pharmacyId": "uuid",
  "medicineName": "Paracetamol",
  "quantity": 150,
  "unitPrice": 6.00,
  "lastUpdated": "2025-01-01T12:00:00Z"
}
```

### DELETE /api/pharmacies/{pharmacyId}/inventory/{itemId}
Delete inventory item (pharmacists only)

**Response (204):** No content

### GET /api/pharmacy/inventory
Get current pharmacist's pharmacy inventory

**Response (200):**
```json
[
  {
    "id": "uuid",
    "pharmacyId": "uuid",
    "medicineName": "Paracetamol",
    "quantity": 100,
    "unitPrice": 5.50,
    "lastUpdated": "2025-01-01T00:00:00Z"
  }
]
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## Security Requirements

1. **JWT Authentication:**
   - Use HS256 or RS256 algorithm
   - Include user ID and role in JWT payload
   - Set appropriate expiration time (e.g., 24 hours)

2. **Password Security:**
   - Use BCrypt with strength 10+ for password hashing
   - Minimum password length: 6 characters

3. **Role-Based Access Control:**
   - Patients: Can only access their own records, prescriptions, consultations
   - Doctors: Can access all patient records, issue prescriptions, reply to consultations
   - Pharmacists: Can view all prescriptions, manage their pharmacy inventory

4. **CORS Configuration:**
   - Allow frontend origin (e.g., http://localhost:5173)
   - Allow credentials
   - Allowed methods: GET, POST, PUT, DELETE, OPTIONS

---

## Environment Variables

Create `application.properties`:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/healthtrack
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=your_secret_key_here_minimum_256_bits
jwt.expiration=86400000

# Server
server.port=8080

# CORS
cors.allowed.origins=http://localhost:5173
```

---

## Implementation Notes

1. Use Spring Security with JWT for authentication
2. Use JPA/Hibernate for database operations
3. Implement custom UserDetailsService for authentication
4. Use @PreAuthorize annotations for role-based access
5. Implement GlobalExceptionHandler for consistent error responses
6. Use DTOs for request/response mapping
7. Implement proper validation using @Valid and javax.validation
8. Use Lombok to reduce boilerplate code
9. Implement audit fields (createdAt, updatedAt) using @CreatedDate and @LastModifiedDate
10. Use proper HTTP status codes for all responses
