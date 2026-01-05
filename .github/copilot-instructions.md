# Health Record Tracker Frontend - AI Coding Guidelines

## Architecture Overview
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend Integration**: Spring Boot API (transitioning from Supabase)
- **Role-Based App**: Patient, Doctor, Pharmacist dashboards with conditional rendering
- **Service Layer**: Centralized API calls in `src/services/` with base `api.ts` handling JWT auth
- **Data Flow**: Services → API → Spring Boot backend → MySQL database

## Key Patterns & Conventions

### API Integration
- Use service layer: Import from `src/services/` (e.g., `authService.login()`)
- Base API service (`src/services/api.ts`) manages JWT tokens in localStorage automatically
- All requests include `Authorization: Bearer ${token}` header
- Environment: `VITE_API_BASE_URL=http://localhost:8080/api`
- Services use `apiService.get/post/put/delete()` with typed responses
- Backend must run on `http://localhost:8080` for development

### Type Safety
- All data models in `src/types/index.ts` (User, Prescription, HealthRecord, etc.)
- Use interfaces for API requests/responses (e.g., `CreatePrescriptionRequest`)
- Role types: `'patient' | 'doctor' | 'pharmacist'`

### Component Structure
- Role-based dashboards in `src/pages/` (AuthPage, PatientDashboard, DoctorDashboard, PharmacistDashboard)
- No routing library; conditional rendering in `App.tsx` based on `user.role`
- Authentication check on app load via `authService.getCurrentUser()`

### Styling
- Tailwind CSS with role-specific gradients:
  - Patients: `from-blue-50 to-indigo-50`
  - Doctors: `from-green-50 to-emerald-50`
  - Pharmacists: `from-orange-50 to-red-50`
- Consistent animations: `animate-spin`, `transition-all duration-300`
- Responsive design with mobile-first approach

### State Management
- React hooks only (`useState`, `useEffect`)
- Data fetching pattern: loading state + try/catch + finally
- In `fetchData` functions, wrap each service call in individual try/catch blocks for debugging
- Example:
  ```typescript
  const fetchData = async () => {
    setLoading(true);
    try {
      // Individual try/catch for each service
      try { data1 = await service1.getData(); } catch (error) { console.error('FAILED: service1', error); }
      try { data2 = await service2.getData(); } catch (error) { console.error('FAILED: service2', error); }
    } finally {
      setLoading(false);
    }
  };
  ```

## Developer Workflows

### Development
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run typecheck    # TypeScript check
npm run lint         # ESLint check
npm run build        # Production build
```

### API Testing
- Backend must run on `http://localhost:8080`
- Test endpoints via `src/services/` functions
- JWT tokens persist in localStorage across sessions

## Common Tasks

### Adding New API Endpoint
1. Define types in `src/types/index.ts`
2. Add method to relevant service (e.g., `prescriptionService.ts`)
3. Use `apiService.get/post/put/delete()` with typed responses

### Role-Based Features
- Check `user.role` for conditional UI
- Update `App.tsx` routing if needed
- Ensure API endpoints respect role permissions

### Error Handling
- Catch API errors in components
- Log to console with descriptive messages (e.g., '[Component] FAILED: Service name', error)
- JWT expiry handled by backend (401 responses)
- For network errors, check if backend is running

## File Organization
- `src/services/`: API service layer
- `src/types/`: TypeScript interfaces
- `src/pages/`: Dashboard components
- `src/lib/`: Utilities (Supabase client, legacy - avoid using)

## Migration Notes
- Currently transitioning from Supabase to Spring Boot API
- Update dashboards to use `src/services/` instead of Supabase calls
- Reference `PatientDashboard_new.tsx` for updated API integration pattern
- Legacy Supabase code in `src/lib/supabase.ts` should not be used