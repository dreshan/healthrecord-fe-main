import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { healthRecordService } from '../services/healthRecordService';
import { prescriptionService } from '../services/prescriptionService';
import { consultationService } from '../services/consultationService';
import { pharmacyService } from '../services/pharmacyService';
import { userService } from '../services/userService';
import { fileUploadService } from '../services/fileUploadService';
import { pharmacyAssignmentService, PharmacyAssignment } from '../services/pharmacyAssignmentService';
import {
  HealthRecord,
  Prescription,
  Consultation,
  Pharmacy,
  PharmacyInventory,
  User,
} from '../types';
import { LogOut, Upload, FileText, Pill, MessageSquare, Search, Download, ExternalLink, Store, Calendar } from 'lucide-react';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions' | 'consultations' | 'pharmacy'>('records');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [medicines, setMedicines] = useState<PharmacyInventory[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [pharmacists, setPharmacists] = useState<User[]>([]);
  const [pharmacyAssignments, setPharmacyAssignments] = useState<PharmacyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordType, setRecordType] = useState('lab_report');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);
  const [searchMedicine, setSearchMedicine] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedPrescriptionForAssignment, setSelectedPrescriptionForAssignment] = useState<number | null>(null);
  const [selectedPharmacistForAssignment, setSelectedPharmacistForAssignment] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'pharmacy') {
      loadPharmacyAssignments();
    }
  }, [activeTab]);

  const loadPharmacyAssignments = async () => {
    try {
      console.log('[Patient Dashboard] Loading pharmacy assignments...');
      const assignments = await pharmacyAssignmentService.getPatientAssignments();
      console.log('[Patient Dashboard] Assignments loaded:', assignments.length);
      setPharmacyAssignments(assignments);
    } catch (error) {
      console.error('[Patient Dashboard] Failed to load pharmacy assignments:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('[Patient Dashboard] Starting to fetch data...');
      console.log('[Patient Dashboard] User:', user);

      // Fetch each service individually to identify which one fails
      let recordsData: HealthRecord[] = [];
      let prescriptionsData: Prescription[] = [];
      let consultationsData: Consultation[] = [];
      let pharmaciesData: Pharmacy[] = [];
      let doctorsData: User[] = [];

      try {
        console.log('[Patient Dashboard] Fetching health records...');
        recordsData = await healthRecordService.getMyRecords();
        console.log('[Patient Dashboard] Health records fetched:', recordsData.length);
      } catch (error) {
        console.error('[Patient Dashboard] FAILED: Health records', error);
      }

      try {
        console.log('[Patient Dashboard] Fetching prescriptions...');
        prescriptionsData = await prescriptionService.getMyPrescriptions();
        console.log('[Patient Dashboard] Prescriptions fetched:', prescriptionsData.length);
      } catch (error) {
        console.error('[Patient Dashboard] FAILED: Prescriptions', error);
      }

      try {
        console.log('[Patient Dashboard] Fetching consultations...');
        consultationsData = await consultationService.getMyConsultations();
        console.log('[Patient Dashboard] Consultations fetched:', consultationsData.length);
      } catch (error) {
        console.error('[Patient Dashboard] FAILED: Consultations', error);
      }

      try {
        console.log('[Patient Dashboard] Fetching pharmacies...');
        pharmaciesData = await pharmacyService.getAllPharmacies();
        console.log('[Patient Dashboard] Pharmacies fetched:', pharmaciesData.length);
      } catch (error) {
        console.error('[Patient Dashboard] FAILED: Pharmacies', error);
      }

      try {
        console.log('[Patient Dashboard] Fetching doctors...');
        doctorsData = await userService.getUsersByRole('DOCTOR');
        console.log('[Patient Dashboard] Doctors fetched:', doctorsData.length);
      } catch (error) {
        console.error('[Patient Dashboard] FAILED: Doctors', error);
      }

      let pharmacistsData: User[] = [];
      try {
        console.log('[Patient Dashboard] Fetching pharmacists...');
        pharmacistsData = await userService.getUsersByRole('PHARMACIST');
        console.log('[Patient Dashboard] Pharmacists fetched:', pharmacistsData.length);
        console.log('[Patient Dashboard] Pharmacists data:', pharmacistsData);
        console.log('[Patient Dashboard] Pharmacies data:', pharmaciesData);
      } catch (error) {
        console.error('[Patient Dashboard] FAILED: Pharmacists', error);
      }

      setHealthRecords(recordsData);
      setPrescriptions(prescriptionsData);
      setConsultations(consultationsData);
      setPharmacies(pharmaciesData);
      setDoctors(doctorsData);
      setPharmacists(pharmacistsData);
    } catch (error) {
      console.error('[Patient Dashboard] Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = fileUploadService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  };

  const handleUploadRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle) {
      setUploadError('Please enter a record title');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      let fileUrl: string | undefined;

      if (selectedFile) {
        const filePath = await fileUploadService.uploadHealthRecord(selectedFile, user.id);
        fileUrl = filePath;
      }

      await healthRecordService.createRecord({
        title: recordTitle,
        recordType,
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
        fileUrl,
      });

      setRecordTitle('');
      setSelectedFile(null);
      setRecordType('lab_report');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchData();
    } catch (error) {
      console.error('Failed to upload record:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload record');
    } finally {
      setUploading(false);
    }
  };

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms || !selectedDoctor) return;

    try {
      // Check if token exists before making request
      const token = localStorage.getItem('authToken');
      console.log('[Consultation] Token exists:', !!token);
      console.log('[Consultation] Creating consultation for doctor:', selectedDoctor);

      if (!token) {
        alert('Your session has expired. Please login again.');
        onLogout();
        return;
      }

      await consultationService.createConsultation({
        doctorId: selectedDoctor,
        symptoms: symptoms,
        appointmentDate: appointmentDate || undefined,
      });

      alert('Consultation request sent successfully!');
      setSymptoms('');
      setAppointmentDate('');
      setSelectedDoctor('');
      fetchData();
    } catch (error) {
      console.error('Failed to create consultation:', error);
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          alert('Authentication failed. Please logout and login again.');
        } else {
          alert('Failed to create consultation: ' + error.message);
        }
      }
    }
  };

  const fetchPharmacyMedicines = async (pharmacyId: number) => {
    try {
      const data = await pharmacyService.getPharmacyInventory(pharmacyId);
      setMedicines(data);
    } catch (error) {
      console.error('Failed to fetch pharmacy medicines:', error);
    }
  };

  const handleAssignPrescriptionToPharmacy = async () => {
    if (!selectedPrescriptionForAssignment || !selectedPharmacistForAssignment) return;

    try {
      await pharmacyAssignmentService.assignToPharmacy(
        selectedPrescriptionForAssignment,
        selectedPharmacistForAssignment
      );

      setSelectedPrescriptionForAssignment(null);
      setSelectedPharmacistForAssignment(null);
      await loadPharmacyAssignments();
      alert('Prescription assigned to pharmacy successfully!');
    } catch (error) {
      console.error('Failed to assign prescription:', error);
      alert('Failed to assign prescription to pharmacy');
    }
  };

  const handleViewFile = async (fileUrl: string) => {
    try {
      const signedUrl = await fileUploadService.getSignedUrl(fileUrl);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Failed to get file URL:', error);
      setUploadError('Failed to open file');
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">HealthTrack - Patient</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
          {/* Debug section */}
          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Logged in as: {user.email} ({user.role}) | Token: {localStorage.getItem('authToken') ? 'Present' : 'Missing'}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 border-b">
            {[
              { id: 'records', label: 'Health Records', icon: FileText },
              { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
              { id: 'consultations', label: 'Consultations', icon: MessageSquare },
              { id: 'pharmacy', label: 'Pharmacy', icon: Search },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-4 flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === id
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'records' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Health Record</h2>
                  <form onSubmit={handleUploadRecord} className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={recordTitle}
                        onChange={(e) => setRecordTitle(e.target.value)}
                        placeholder="Record Title (e.g., Blood Test)"
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        required
                      />
                      <select
                        value={recordType}
                        onChange={(e) => setRecordType(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      >
                        <option value="lab_report">Lab Report</option>
                        <option value="prescription">Prescription</option>
                        <option value="medical_history">Medical History</option>
                        <option value="vaccination">Vaccination</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload PDF File (Optional, Max 10MB)
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {selectedFile && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>

                    {uploadError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{uploadError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Record'}
                    </button>
                  </form>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Records</h2>
                  {healthRecords.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No records uploaded yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {healthRecords.map((record) => (
                        <div
                          key={record.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 hover:border-blue-400"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900">{record.title}</h3>
                              <p className="text-sm text-gray-500 capitalize">{record.recordType.replace('_', ' ')}</p>
                              {record.description && (
                                <p className="text-xs text-gray-600 mt-1">{record.description}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(record.createdAt).toLocaleDateString()}
                              </p>
                              {record.fileUrl && (
                                <button
                                  onClick={() => handleViewFile(record.fileUrl!)}
                                  className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  View File
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Prescriptions & Clinic Visits</h2>
                {prescriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No prescriptions or clinic visit requests yet</p>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className={`border rounded-lg p-5 hover:shadow-lg transition-all duration-300 ${
                          prescription.isClinicVisit
                            ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                            : 'border-gray-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            {prescription.isClinicVisit ? (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-semibold">
                                  Clinic Visit Required
                                </span>
                              </div>
                            ) : (
                              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                <Pill className="inline w-5 h-5 mr-2 text-blue-600" />
                                Prescription
                              </h3>
                            )}
                            {prescription.doctor && (
                              <p className="text-sm text-gray-600">By: Dr. {prescription.doctor.fullName}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(prescription.createdAt).toLocaleDateString()} at{' '}
                              {new Date(prescription.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              prescription.status === 'filled'
                                ? 'bg-green-100 text-green-700'
                                : prescription.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {prescription.status}
                          </span>
                        </div>

                        {prescription.diagnosis && (
                          <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                            <p className="text-sm font-semibold text-gray-700">Diagnosis:</p>
                            <p className="text-gray-800">{prescription.diagnosis}</p>
                          </div>
                        )}

                        {!prescription.isClinicVisit && prescription.medications && (
                          <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm font-semibold text-blue-700 mb-1">Medications:</p>
                            <p className="text-gray-800">{prescription.medications}</p>
                            {prescription.dosage && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Dosage:</span> {prescription.dosage}
                              </p>
                            )}
                          </div>
                        )}

                        {prescription.instructions && (
                          <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                            <p className="text-sm font-semibold text-green-700">
                              {prescription.isClinicVisit ? 'Clinic Visit Instructions:' : 'Instructions:'}
                            </p>
                            <p className="text-gray-700">{prescription.instructions}</p>
                          </div>
                        )}

                        {prescription.pharmacy && (
                          <div className="mt-3 p-4 bg-teal-50 rounded-lg border-2 border-teal-300">
                            <div className="flex items-center gap-2 mb-2">
                              <Store className="w-5 h-5 text-teal-600" />
                              <p className="font-semibold text-teal-900">Assigned to Pharmacy</p>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">{prescription.pharmacy.name}</span>
                            </p>
                            <p className="text-sm text-gray-600">{prescription.pharmacy.address}</p>
                            {prescription.pharmacy.phone && (
                              <p className="text-sm text-gray-600">Tel: {prescription.pharmacy.phone}</p>
                            )}
                          </div>
                        )}

                        {prescription.pharmacyNotes && (
                          <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-300">
                            <p className="text-sm font-semibold text-blue-700 mb-2">Pharmacy Update:</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{prescription.pharmacyNotes}</p>
                            {prescription.pharmacyUpdatedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Updated: {new Date(prescription.pharmacyUpdatedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {!prescription.isClinicVisit && !prescription.assignedPharmacyId && (
                          <>
                            {selectedPrescriptionForAssignment !== prescription.id ? (
                              <button
                                onClick={() => setSelectedPrescriptionForAssignment(prescription.id)}
                                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <Store className="w-4 h-4" />
                                Assign to Pharmacy
                              </button>
                            ) : (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3">Select Pharmacy & Pharmacist</h4>
                                <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
                                  {pharmacists.length === 0 ? (
                                    <p className="text-sm text-gray-500">No pharmacists available</p>
                                  ) : (
                                    pharmacists.map((pharmacist) => {
                                      const pharmacy = pharmacies.find(p => p.id === Number(pharmacist.pharmacyId));
                                      return (
                                        <button
                                          key={pharmacist.id}
                                          onClick={() => setSelectedPharmacistForAssignment(pharmacist.id)}
                                          className={`w-full text-left p-3 rounded-lg border transition-all duration-300 ${
                                            selectedPharmacistForAssignment === pharmacist.id
                                              ? 'border-blue-500 bg-blue-50'
                                              : 'border-gray-200 hover:border-blue-300'
                                          }`}
                                        >
                                          {pharmacy ? (
                                            <>
                                              <div className="flex items-center gap-2 mb-1">
                                                <Store className="w-4 h-4 text-blue-600" />
                                                <p className="font-bold text-gray-900">{pharmacy.name}</p>
                                              </div>
                                              <p className="text-sm text-gray-600 ml-6">{pharmacy.address}</p>
                                              {pharmacy.phone && (
                                                <p className="text-xs text-gray-500 ml-6">Tel: {pharmacy.phone}</p>
                                              )}
                                              <div className="mt-2 pt-2 border-t border-gray-200 ml-6">
                                                <p className="text-sm font-medium text-gray-700">Pharmacist: {pharmacist.fullName}</p>
                                                <p className="text-xs text-gray-500">{pharmacist.email}</p>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <p className="font-medium text-gray-900">{pharmacist.fullName}</p>
                                              <p className="text-sm text-gray-600">{pharmacist.email}</p>
                                              <p className="text-xs text-orange-600 mt-1">No pharmacy assigned</p>
                                            </>
                                          )}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleAssignPrescriptionToPharmacy}
                                    disabled={!selectedPharmacistForAssignment}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Confirm Assignment
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedPrescriptionForAssignment(null);
                                      setSelectedPharmacistForAssignment(null);
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'consultations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Appointment</h2>
                  <form onSubmit={handleConsultation} className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                      <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        required
                      >
                        <option value="">Choose a doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date & Time (Optional)</label>
                      <input
                        type="datetime-local"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms & Health Concerns</label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe your symptoms, health concerns, or reason for appointment..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 h-32"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Send Appointment Request
                    </button>
                  </form>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Appointments</h2>
                  {consultations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No appointments yet</p>
                  ) : (
                    <div className="space-y-4">
                      {consultations.map((consultation) => (
                        <div
                          key={consultation.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-400"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {consultation.doctor ? `Dr. ${consultation.doctor.fullName}` : 'Doctor'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {new Date(consultation.appointmentDate).toLocaleString()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                consultation.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : consultation.status === 'visit_clinic'
                                    ? 'bg-orange-100 text-orange-700'
                                    : consultation.status === 'cancelled'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {consultation.status === 'visit_clinic' ? 'Clinic Visit Required' : consultation.status}
                            </span>
                          </div>
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                            <p className="text-gray-600">{consultation.symptoms}</p>
                          </div>
                          {consultation.notes && (
                            <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-700">Doctor's Notes:</p>
                              <p className="text-gray-700">{consultation.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pharmacy' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pharmacy Updates</h2>
                <p className="text-gray-600 mb-6">
                  View pharmacy updates for your assigned prescriptions including medicine availability and pricing.
                </p>

                {prescriptions.filter(p => p.assignedPharmacyId).length === 0 && pharmacyAssignments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No prescriptions assigned to pharmacies yet</p>
                    <p className="text-sm text-gray-400">
                      Assign prescriptions from the Prescriptions tab to check medicine availability and pricing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.filter(p => p.assignedPharmacyId).map((prescription) => (
                      <div
                        key={`prescription-${prescription.id}`}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {prescription.medications || 'Prescription'}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                prescription.status === 'fulfilled'
                                  ? 'bg-green-100 text-green-700'
                                  : prescription.status === 'assigned'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {prescription.status.toUpperCase()}
                            </span>
                          </div>
                          {prescription.pharmacy && (
                            <>
                              <p className="text-sm text-gray-900 font-medium">
                                <Store className="inline w-4 h-4 mr-1" />
                                {prescription.pharmacy.name}
                              </p>
                              <p className="text-sm text-gray-600 ml-5">{prescription.pharmacy.address}</p>
                              {prescription.pharmacy.phone && (
                                <p className="text-sm text-gray-600 ml-5">Tel: {prescription.pharmacy.phone}</p>
                              )}
                            </>
                          )}
                          {prescription.doctor && (
                            <p className="text-sm text-gray-600 mt-1">Doctor: {prescription.doctor.fullName}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Prescribed: {new Date(prescription.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {prescription.pharmacyNotes && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-green-700 mb-2">Pharmacy Update:</p>
                              <p className="text-gray-700 whitespace-pre-wrap">{prescription.pharmacyNotes}</p>
                              {prescription.pharmacyUpdatedAt && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Updated: {new Date(prescription.pharmacyUpdatedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                          {!prescription.pharmacyNotes && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                              <p className="text-sm text-yellow-700">
                                Waiting for pharmacy to check availability and update pricing...
                              </p>
                            </div>
                          )}

                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Medications:</span> {prescription.medications}
                            </p>
                            {prescription.dosage && (
                              <p className="text-sm text-gray-700 mt-1">
                                <span className="font-medium">Dosage:</span> {prescription.dosage}
                              </p>
                            )}
                            {prescription.instructions && (
                              <p className="text-sm text-gray-700 mt-1">
                                <span className="font-medium">Instructions:</span> {prescription.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {pharmacyAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {assignment.prescriptionDetails || 'Prescription'}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                assignment.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-700'
                                  : assignment.status === 'IN_PROGRESS'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : assignment.status === 'ASSIGNED'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {assignment.status}
                            </span>
                          </div>
                          {assignment.pharmacyName && (
                            <p className="text-sm text-gray-600">
                              <Store className="inline w-4 h-4 mr-1" />
                              Pharmacy: {assignment.pharmacyName}
                            </p>
                          )}
                          {assignment.doctorName && (
                            <p className="text-sm text-gray-600">Doctor: {assignment.doctorName}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-blue-700">Medicine Availability:</p>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  assignment.medicineAvailability === 'AVAILABLE'
                                    ? 'bg-green-100 text-green-700'
                                    : assignment.medicineAvailability === 'PARTIAL'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : assignment.medicineAvailability === 'UNAVAILABLE'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {assignment.medicineAvailability}
                              </span>
                            </div>

                            {assignment.price && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-lg font-bold text-gray-900">
                                  Total Cost: Rs. {assignment.price.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>

                          {assignment.pharmacyNotes && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-green-700 mb-1">Pharmacy Notes:</p>
                              <p className="text-gray-700">{assignment.pharmacyNotes}</p>
                              {assignment.updatedAt && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Updated: {new Date(assignment.updatedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                          {assignment.medicineAvailability === 'PENDING' && !assignment.pharmacyNotes && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                              <p className="text-sm text-yellow-700">
                                Waiting for pharmacy to check availability and update pricing...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}