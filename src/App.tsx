import { useEffect, useState } from 'react';
import { authService } from './services/authService';
import { User } from './types';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard_new';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          console.log('[App] Current user from backend:', currentUser);
          console.log('[App] User role:', currentUser.role);
          if (currentUser.role) {
            currentUser.role = currentUser.role.toLowerCase() as any;
          }
          console.log('[App] Normalized role:', currentUser.role);
          setUser(currentUser);
        } catch (error) {
          console.error('Token validation failed:', error);
          await authService.logout();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    console.log('[App] Auth success, user:', authenticatedUser);
    console.log('[App] Auth success, user role:', authenticatedUser.role);
    if (authenticatedUser.role) {
      authenticatedUser.role = authenticatedUser.role.toLowerCase() as any;
    }
    console.log('[App] Normalized role:', authenticatedUser.role);
    setUser(authenticatedUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  console.log('[App] Rendering with user role:', user.role);

  return (
    <>
      {user.role === 'patient' && <PatientDashboard user={user} onLogout={handleLogout} />}
      {user.role === 'doctor' && <DoctorDashboard user={user} onLogout={handleLogout} />}
      {user.role === 'pharmacist' && <PharmacistDashboard user={user} onLogout={handleLogout} />}
      {!['patient', 'doctor', 'pharmacist'].includes(user.role) && (
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Unknown Role</h2>
            <p className="text-gray-700 mb-4">User role "{user.role}" is not recognized.</p>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;