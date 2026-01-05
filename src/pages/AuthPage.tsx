import { useState } from 'react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';
import { Heart, Pill, User } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (user: UserType) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor' | 'pharmacist'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [pharmacyId, setPharmacyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login({ email, password });
        onAuthSuccess(response.user);
      } else {
        const response = await authService.register({
          email,
          password,
          fullName,
          role,
          phone,
          address,
          licenseNumber: role === 'doctor' ? licenseNumber : undefined,
          pharmacyId: role === 'pharmacist' ? pharmacyId : undefined,
        });
        onAuthSuccess(response.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-teal-600 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 text-white space-y-8">
            <div className="flex items-center gap-3">
              <Heart className="w-12 h-12" fill="currentColor" />
              <h1 className="text-4xl font-bold">HealthTrack</h1>
            </div>

            <p className="text-xl opacity-90 leading-relaxed">
              Your complete digital health management platform. Securely manage medical records, consult with doctors, and verify prescriptions at pharmacies.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">For Everyone</h3>
                  <p className="text-sm opacity-80">Patients, Doctors & Pharmacists</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Pill className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Streamlined Care</h3>
                  <p className="text-sm opacity-80">Digital prescriptions and medicine tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex lg:hidden items-center gap-2 justify-center">
              <Heart className="w-8 h-8 text-blue-600" fill="currentColor" />
              <h1 className="text-2xl font-bold text-gray-900">HealthTrack</h1>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-center text-gray-600 mb-8">
              {isLogin ? 'Sign in to your account' : 'Create your healthcare account'}
            </p>

            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none"
                      placeholder="123 Main Street, City, State, ZIP"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['patient', 'doctor', 'pharmacist'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-3 px-3 rounded-lg font-medium transition-all duration-300 capitalize ${
                            role === r
                              ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {role === 'doctor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medical License Number</label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        placeholder="e.g., MD123456"
                        required
                      />
                    </div>
                  )}

                  {role === 'pharmacist' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacy ID</label>
                      <input
                        type="text"
                        value={pharmacyId}
                        onChange={(e) => setPharmacyId(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        placeholder="Contact admin for Pharmacy ID"
                      />
                      <p className="mt-1 text-xs text-gray-500">Please contact your pharmacy administrator for your Pharmacy ID</p>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="w-full mt-6 text-center text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}