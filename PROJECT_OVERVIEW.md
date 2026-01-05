# Health Record Tracker - Complete Project Overview

## Project Description

A comprehensive digital health management platform that connects patients, doctors, and pharmacists. The system enables:

- Patients to manage health records, receive prescriptions, and consult doctors
- Doctors to issue prescriptions and provide medical consultations
- Pharmacists to manage inventory and fulfill prescriptions

## Architecture

### Frontend (healthrecordfe)
- **Technology**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **API Communication**: Fetch API with service layer architecture
- **Build Tool**: Vite

### Backend (healthrecordbe)
- **Technology**: Spring Boot 3.2+
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Spring Security with BCrypt
- **ORM**: JPA/Hibernate

## Project Structure

```
root/
├── healthrecordfe/          # React Frontend
│   ├── src/
│   │   ├── pages/          # Dashboard components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx
│   ├── SPRING_BOOT_API_SPECIFICATION.md
│   ├── DATABASE_SCHEMA_MYSQL.md
│   ├── README_FRONTEND.md
│   └── package.json
│
└── healthrecordbe/          # Spring Boot Backend (to be created)
    ├── src/main/java/
    │   └── com/healthtrack/
    │       ├── config/
    │       ├── controller/
    │       ├── service/
    │       ├── repository/
    │       ├── entity/
    │       ├── dto/
    │       └── security/
    ├── SPRING_BOOT_SETUP_GUIDE.md
    └── pom.xml
```

## Features by Role

### Patient Features
✅ User registration and authentication
✅ Upload and manage health records (lab reports, prescriptions, medical history, vaccinations)
✅ View prescriptions from doctors with medicine details
✅ Request email consultations with doctors
✅ View consultation replies from doctors
✅ Check medicine availability across pharmacies
✅ Search medicines by name in pharmacy inventories

### Doctor Features
✅ User registration and authentication
✅ View list of all patients
✅ Issue digital prescriptions with multiple medicines per prescription
✅ Specify medicine dosage, quantity, frequency, and duration
✅ View consultation requests from patients
✅ Reply to patient consultations with medical advice
✅ Track prescription status (pending, fulfilled, partially fulfilled)

### Pharmacist Features
✅ User registration and authentication
✅ View all prescriptions and individual medicine items
✅ Fulfill prescription items (mark as fulfilled)
✅ Manage pharmacy inventory (add/update/delete medicines)
✅ Set medicine quantities and prices
✅ Track prescription fulfillment progress

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.5.3 | Type Safety |
| Vite | 5.4.2 | Build Tool |
| Tailwind CSS | 3.4.1 | Styling |
| Lucide React | 0.344.0 | Icons |

### Backend (To Be Implemented)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 3.2+ | Backend Framework |
| Spring Security | 6.2+ | Authentication/Authorization |
| Spring Data JPA | 3.2+ | ORM |
| MySQL | 8.0+ | Database |
| JWT | 0.11.5 | Token Authentication |
| Lombok | Latest | Code Generation |

## Getting Started

### Prerequisites
- **Frontend**: Node.js 18+, npm
- **Backend**: Java 17+, Maven, MySQL 8.0+
- **Tools**: Git, IDE (VS Code/IntelliJ)

### Step 1: Frontend Setup

1. Navigate to frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

### Step 2: Database Setup

1. Install MySQL 8.0+
2. Create database:
   ```sql
   CREATE DATABASE healthtrack;
   ```

3. Run the schema from `DATABASE_SCHEMA_MYSQL.md`

### Step 3: Backend Setup

1. Create Spring Boot project following `SPRING_BOOT_SETUP_GUIDE.md`
2. Configure `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/healthtrack
   spring.datasource.username=root
   spring.datasource.password=your_password
   jwt.secret=your_secret_key_minimum_256_bits
   jwt.expiration=86400000
   cors.allowed.origins=http://localhost:5173
   ```

3. Implement all endpoints from `SPRING_BOOT_API_SPECIFICATION.md`

4. Run Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

Backend will run on `http://localhost:8080`

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Health Records
- `GET /api/health-records` - Get user's records
- `POST /api/health-records` - Create record
- `PUT /api/health-records/{id}` - Update record
- `DELETE /api/health-records/{id}` - Delete record

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription (doctors)
- `GET /api/prescription-items` - Get all items (pharmacists)
- `PUT /api/prescription-items/{id}/fulfill` - Fulfill item

### Consultations
- `GET /api/consultations` - Get consultations
- `POST /api/consultations` - Create consultation (patients)
- `PUT /api/consultations/{id}/reply` - Reply (doctors)

### Pharmacy
- `GET /api/pharmacies` - Get all pharmacies
- `GET /api/pharmacies/{id}/inventory` - Get inventory
- `POST /api/pharmacies/{id}/inventory` - Add medicine
- `DELETE /api/pharmacies/{id}/inventory/{itemId}` - Remove medicine

For complete API specification, see `SPRING_BOOT_API_SPECIFICATION.md`

## Database Schema

### Tables
1. **users** - All user accounts (patients, doctors, pharmacists)
2. **health_records** - Patient health documents
3. **pharmacies** - Pharmacy information
4. **prescriptions** - Doctor-issued prescriptions
5. **prescription_items** - Individual medicines in prescriptions
6. **pharmacy_inventory** - Available medicines at pharmacies
7. **consultations** - Patient-doctor consultations

For complete schema, see `DATABASE_SCHEMA_MYSQL.md`

## Authentication Flow

1. User registers/logs in via frontend
2. Backend validates credentials and generates JWT token
3. Frontend stores token in localStorage
4. Frontend includes token in Authorization header for all API requests
5. Backend validates token on each request
6. User data and role extracted from token for authorization

## Security Features

### Frontend
- JWT token stored in localStorage
- Automatic token inclusion in API requests
- Role-based UI rendering
- Logout clears token

### Backend
- BCrypt password hashing (strength 10+)
- JWT token authentication
- Role-based access control (@PreAuthorize)
- CORS configuration
- SQL injection prevention (JPA)
- Input validation
- Global exception handling

## UI/UX Features

### Design System
- **Color Themes**:
  - Patient: Blue/Teal gradient
  - Doctor: Green/Emerald gradient
  - Pharmacist: Orange/Red gradient

- **Animations**:
  - 300ms smooth transitions
  - Hover effects on all interactive elements
  - Loading spinners
  - Fade-in animations

- **Responsive Design**:
  - Mobile-first approach
  - Breakpoints: sm (640px), md (768px), lg (1024px)
  - Grid layouts adapt to screen size
  - Touch-friendly buttons

### Components
- Tab navigation for dashboard sections
- Color-coded status badges
- Search and filter functionality
- Form validation with error messages
- Empty states with helpful messages
- Loading states with spinners

## Testing Guide

### Test Scenarios

#### Patient Flow
1. Register as patient
2. Login
3. Upload health record
4. View prescriptions (empty initially)
5. Create consultation with doctor
6. Check medicine availability at pharmacies

#### Doctor Flow
1. Register as doctor
2. Login
3. View patient list
4. Select patient and issue prescription
5. View consultations
6. Reply to patient consultation

#### Pharmacist Flow
1. Register as pharmacist (with pharmacy_id)
2. Login
3. View pending prescriptions
4. Add medicines to inventory
5. Fulfill prescription items
6. Update inventory quantities

### API Testing
Use Postman or curl to test each endpoint. Example:
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","fullName":"Test User","role":"patient"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

## Development Workflow

### Frontend Development
1. Make changes in `src/`
2. Vite hot-reloads automatically
3. Check browser console for errors
4. Test API integration with backend

### Backend Development
1. Implement controller, service, repository
2. Use Spring Boot DevTools for hot reload
3. Test with Postman
4. Check logs for errors

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/add-notifications

# Make changes and commit
git add .
git commit -m "Add email notifications"

# Push and create PR
git push origin feature/add-notifications
```

## Deployment

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL`

### Backend (AWS/Heroku/Railway)
1. Package application: `./mvnw clean package`
2. Deploy JAR file
3. Set environment variables (database, JWT secret)
4. Configure domain and SSL

### Database (AWS RDS/PlanetScale)
1. Create MySQL instance
2. Import schema
3. Update backend connection string
4. Enable SSL if required

## Future Enhancements

### Phase 1 (Core Features)
- [ ] File upload for health records (AWS S3)
- [ ] Email notifications for consultations
- [ ] Password reset functionality
- [ ] Profile picture upload

### Phase 2 (Advanced Features)
- [ ] Appointment scheduling
- [ ] Video consultations (WebRTC)
- [ ] Prescription QR codes
- [ ] Medicine interaction warnings
- [ ] Analytics dashboard for doctors

### Phase 3 (Enterprise)
- [ ] Multi-pharmacy chains
- [ ] Insurance integration
- [ ] Lab test ordering
- [ ] Payment processing
- [ ] Mobile app (React Native)

## Troubleshooting

### Frontend Issues

**Issue**: API calls failing with CORS error
**Solution**: Check backend CORS configuration allows `http://localhost:5173`

**Issue**: Build fails with type errors
**Solution**: Run `npm run typecheck` to identify TypeScript issues

### Backend Issues

**Issue**: JWT authentication not working
**Solution**: Ensure `jwt.secret` is at least 256 bits (32 characters)

**Issue**: Database connection failed
**Solution**: Check MySQL is running: `sudo service mysql status`

**Issue**: 403 Forbidden on API calls
**Solution**: Check user role has permission for endpoint in SecurityConfig

## Documentation Files

| File | Purpose |
|------|---------|
| `PROJECT_OVERVIEW.md` | This file - complete project overview |
| `README_FRONTEND.md` | Frontend-specific documentation |
| `SPRING_BOOT_API_SPECIFICATION.md` | Complete API endpoint specification |
| `DATABASE_SCHEMA_MYSQL.md` | MySQL database schema |
| `SPRING_BOOT_SETUP_GUIDE.md` | Backend setup instructions |

## Support & Resources

### Documentation
- [React Docs](https://react.dev/)
- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MySQL Docs](https://dev.mysql.com/doc/)

### Code Examples
- Authentication flow: See `src/services/authService.ts`
- API service pattern: See `src/services/api.ts`
- Dashboard components: See `src/pages/`

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding conventions
4. Write tests
5. Submit pull request

## License

Private project - All rights reserved

---

## Quick Start Checklist

### Frontend
- [ ] Node.js 18+ installed
- [ ] npm install completed
- [ ] .env file created
- [ ] npm run dev working

### Backend
- [ ] Java 17+ installed
- [ ] MySQL 8.0+ installed
- [ ] Database created
- [ ] Schema imported
- [ ] application.properties configured
- [ ] Spring Boot app running

### Testing
- [ ] Can register new user
- [ ] Can login
- [ ] JWT token received
- [ ] Dashboard loads correctly
- [ ] Can create records
- [ ] API endpoints respond

## Status

**Frontend**: ✅ Complete and production-ready
**Backend**: ⏳ To be implemented (comprehensive guide provided)
**Database**: ✅ Schema designed and documented
**Documentation**: ✅ Complete

---

**Last Updated**: 2025-01-09
**Version**: 1.0.0
