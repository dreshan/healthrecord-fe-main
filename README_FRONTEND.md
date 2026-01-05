# Health Record Tracker - Frontend (React)

## Overview
This is the React TypeScript frontend for the Health Record Tracker system. It's designed to work with a Spring Boot backend.

## Project Structure

```
healthrecordfe/
├── src/
│   ├── pages/              # Dashboard components for each role
│   │   ├── AuthPage.tsx           # Login/Register page
│   │   ├── PatientDashboard_new.tsx    # Patient dashboard
│   │   ├── DoctorDashboard.tsx    # Doctor dashboard (needs update)
│   │   └── PharmacistDashboard.tsx # Pharmacist dashboard (needs update)
│   │
│   ├── services/           # API service layer
│   │   ├── api.ts                 # Base API service with auth
│   │   ├── authService.ts         # Authentication endpoints
│   │   ├── healthRecordService.ts # Health records endpoints
│   │   ├── prescriptionService.ts # Prescriptions endpoints
│   │   ├── consultationService.ts # Consultations endpoints
│   │   ├── pharmacyService.ts     # Pharmacy & inventory endpoints
│   │   └── userService.ts         # User management endpoints
│   │
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts               # All type definitions
│   │
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # App entry point
│   └── index.css           # Tailwind CSS imports
│
├── SPRING_BOOT_API_SPECIFICATION.md  # Complete API documentation
├── DATABASE_SCHEMA_MYSQL.md          # MySQL database schema
└── package.json
```

## Features

### Patient Dashboard
- Upload and manage health records
- View prescriptions from doctors
- Request email consultations with doctors
- Check medicine availability at pharmacies
- Search medicines across pharmacies

### Doctor Dashboard
- View patient list
- Issue digital prescriptions with multiple medicines
- Reply to patient consultation requests
- Track prescription status

### Pharmacist Dashboard
- View and fulfill prescriptions
- Manage pharmacy inventory
- Add/update/delete medicines
- Track prescription fulfillment status

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Fetch API** - HTTP requests

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Spring Boot backend running on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in root directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

3. Start development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Spring Boot API URL | `http://localhost:8080/api` |

## API Integration

The frontend uses a clean service layer architecture:

### API Service (`services/api.ts`)
- Handles JWT token management (localStorage)
- Automatic token inclusion in requests
- Centralized error handling
- Base HTTP methods (GET, POST, PUT, DELETE)

### Example Usage

```typescript
import { authService } from './services/authService';
import { healthRecordService } from './services/healthRecordService';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Create health record
const record = await healthRecordService.createRecord({
  title: 'Blood Test',
  recordType: 'lab_report',
  description: 'Annual checkup'
});
```

## Authentication Flow

1. User enters credentials on `AuthPage`
2. Frontend sends POST to `/api/auth/login` or `/api/auth/register`
3. Backend returns JWT token and user object
4. Token stored in localStorage
5. Token included in all subsequent API requests via Authorization header
6. On app reload, token is checked via `/api/auth/me`

## Type Safety

All API responses and requests are fully typed using TypeScript interfaces defined in `src/types/index.ts`.

### Key Types

```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'patient' | 'doctor' | 'pharmacist';
  // ... other fields
}

interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  diagnosis: string;
  status: 'pending' | 'fulfilled' | 'partially_fulfilled' | 'cancelled';
  items?: PrescriptionItem[];
  // ... other fields
}
```

## Styling

The app uses Tailwind CSS with custom gradients and animations:

- **Patients**: Blue/Teal gradient theme
- **Doctors**: Green/Emerald gradient theme
- **Pharmacists**: Orange/Red gradient theme

### Key UI Features
- Smooth transitions (300ms)
- Hover effects on all interactive elements
- Loading spinners
- Color-coded status badges
- Responsive design (mobile-first)
- Gradient backgrounds
- Shadow effects for depth

## State Management

Currently uses React's built-in state management with `useState` and `useEffect`. No external state library is needed for the current complexity.

### Data Fetching Pattern

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await someService.getData();
    setData(result);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    setLoading(false);
  }
};
```

## Error Handling

Errors are caught and logged to console. You may want to add:
- Toast notifications for user feedback
- Global error boundary component
- Retry logic for failed requests

## TODO: Complete Integration

The following files need to be updated to use the new API services (currently using Supabase):

1. `src/pages/DoctorDashboard.tsx` - Update to use API services
2. `src/pages/PharmacistDashboard.tsx` - Update to use API services

Reference `src/pages/PatientDashboard_new.tsx` for the updated pattern.

## Testing

To test the frontend:

1. Ensure Spring Boot backend is running on `http://localhost:8080`
2. Create test users for each role (patient, doctor, pharmacist)
3. Test complete workflows:
   - Patient uploads records
   - Patient requests consultation
   - Doctor replies to consultation
   - Doctor issues prescription
   - Patient views prescription
   - Pharmacist fulfills prescription
   - Patient checks medicine availability

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- No sensitive data in frontend code
- All authentication handled by backend
- CORS must be configured on backend to allow frontend origin

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading can be added for routes
- Image optimization if file uploads are added
- API response caching can be implemented
- Debouncing for search inputs

## Deployment

### Vercel/Netlify
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
EXPOSE 3000
```

## Contributing

1. Follow existing code structure
2. Use TypeScript for type safety
3. Follow component naming conventions
4. Keep services separate from UI
5. Add proper error handling

## Support

For backend API specification, see `SPRING_BOOT_API_SPECIFICATION.md`
For database schema, see `DATABASE_SCHEMA_MYSQL.md`

## License

Private project - All rights reserved
