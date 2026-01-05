import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Upload, FileText, Pill, MessageSquare, Search, Download } from 'lucide-react';
import { fileUploadService } from '../services/fileUploadService';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions' | 'consultations' | 'pharmacy'>('records');
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordType, setRecordType] = useState('lab_report');
  const [recordDescription, setRecordDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [consultationSubject, setConsultationSubject] = useState('');
  const [consultationMessage, setConsultationMessage] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [searchMedicine, setSearchMedicine] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
    fetchData();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const [recordsData, prescriptionsData, consultationsData, pharmaciesData] = await Promise.all([
        supabase.from('health_records').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('prescriptions').select('*, prescription_items(*)').eq('patient_id', user.id),
        supabase.from('consultations').select('*').eq('patient_id', user.id),
        supabase.from('pharmacies').select('*'),
      ]);

      const records = recordsData.data || [];

      const recordsWithUrls = await Promise.all(
        records.map(async (record) => {
          if (record.file_url) {
            try {
              const signedUrl = await fileUploadService.getSignedUrl(record.file_url);
              return { ...record, downloadUrl: signedUrl };
            } catch (error) {
              console.error('Error getting signed URL:', error);
              return record;
            }
          }
          return record;
        })
      );

      setHealthRecords(recordsWithUrls);
      setPrescriptions(prescriptionsData.data || []);
      setConsultations(consultationsData.data || []);
      setPharmacies(pharmaciesData.data || []);
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');

    if (file) {
      const validation = fileUploadService.validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    setUploadError('');

    try {
      let fileUrl = null;

      if (selectedFile) {
        fileUrl = await fileUploadService.uploadHealthRecord(selectedFile, user.id);
      }

      const { error } = await supabase.from('health_records').insert([
        {
          patient_id: user.id,
          title: recordTitle,
          record_type: recordType,
          description: recordDescription || `Uploaded on ${new Date().toLocaleDateString()}`,
          file_url: fileUrl,
        },
      ]);

      if (error) throw error;

      setRecordTitle('');
      setRecordType('lab_report');
      setRecordDescription('');
      setSelectedFile(null);
      fetchData();
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload record');
    } finally {
      setUploading(false);
    }
  };

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationSubject || !consultationMessage) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const doctors = await supabase.from('user_profiles').select('id').eq('role', 'doctor');
    const doctorId = doctors.data?.[0]?.id;

    if (doctorId) {
      const { error } = await supabase.from('consultations').insert([
        {
          doctor_id: doctorId,
          patient_id: user.id,
          subject: consultationSubject,
          message: consultationMessage,
        },
      ]);

      if (!error) {
        setConsultationSubject('');
        setConsultationMessage('');
        fetchData();
      }
    }
  };

  const fetchPharmacyMedicines = async (pharmacyId: string) => {
    const { data } = await supabase.from('pharmacy_inventory').select('*').eq('pharmacy_id', pharmacyId);
    setMedicines(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">HealthTrack - Patient</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
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
                  <form onSubmit={handleUploadRecord} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={recordTitle}
                        onChange={(e) => setRecordTitle(e.target.value)}
                        placeholder="Record Title (e.g., Blood Test)"
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        required
                        disabled={uploading}
                      />
                      <select
                        value={recordType}
                        onChange={(e) => setRecordType(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        disabled={uploading}
                      >
                        <option value="lab_report">Lab Report</option>
                        <option value="prescription">Prescription</option>
                        <option value="medical_history">Medical History</option>
                        <option value="vaccination">Vaccination</option>
                        <option value="xray">X-Ray</option>
                        <option value="mri">MRI Scan</option>
                        <option value="ct_scan">CT Scan</option>
                        <option value="ultrasound">Ultrasound</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <textarea
                      value={recordDescription}
                      onChange={(e) => setRecordDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 mb-4 h-24"
                      disabled={uploading}
                    />

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload PDF File (Max 10MB)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-300 bg-white">
                            <Upload className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {selectedFile ? selectedFile.name : 'Choose PDF file'}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>

                    {uploadError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{uploadError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={uploading || !recordTitle}
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
                              <p className="text-sm text-gray-500 capitalize">
                                {record.record_type.replace('_', ' ')}
                              </p>
                              {record.description && (
                                <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(record.created_at).toLocaleDateString()}
                              </p>
                              {record.downloadUrl && (
                                <a
                                  href={record.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                >
                                  <Download className="w-4 h-4" />
                                  Download PDF
                                </a>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Prescriptions</h2>
                {prescriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No prescriptions yet</p>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-400"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">Diagnosis: {prescription.diagnosis}</h3>
                            <p className="text-sm text-gray-500">{prescription.instructions}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              prescription.status === 'fulfilled'
                                ? 'bg-green-100 text-green-700'
                                : prescription.status === 'partially_fulfilled'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {prescription.status}
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {prescription.prescription_items?.map((item: any) => (
                            <div key={item.id} className="text-sm text-gray-600 pl-4 border-l-2 border-blue-300">
                              {item.medicine_name} - {item.dosage} ({item.frequency})
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'consultations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Consultation Request</h2>
                  <form onSubmit={handleConsultation} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <input
                      type="text"
                      value={consultationSubject}
                      onChange={(e) => setConsultationSubject(e.target.value)}
                      placeholder="Subject (e.g., Headache consultation)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 mb-4"
                      required
                    />
                    <textarea
                      value={consultationMessage}
                      onChange={(e) => setConsultationMessage(e.target.value)}
                      placeholder="Describe your symptoms or health concern..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 mb-4 h-32"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Send Request
                    </button>
                  </form>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Consultations</h2>
                  {consultations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No consultations yet</p>
                  ) : (
                    <div className="space-y-4">
                      {consultations.map((consultation) => (
                        <div
                          key={consultation.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-400"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{consultation.subject}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                consultation.status === 'replied'
                                  ? 'bg-green-100 text-green-700'
                                  : consultation.status === 'closed'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {consultation.status}
                            </span>
                          </div>
                          <p className="text-gray-600">{consultation.message}</p>
                          {consultation.reply && (
                            <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-700">Doctor's Reply:</p>
                              <p className="text-gray-700">{consultation.reply}</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Medicine Availability</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-400"
                      onClick={() => {
                        setSelectedPharmacy(selectedPharmacy === pharmacy.id ? null : pharmacy.id);
                        if (selectedPharmacy !== pharmacy.id) fetchPharmacyMedicines(pharmacy.id);
                      }}
                    >
                      <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                      <p className="text-sm text-gray-600">{pharmacy.address}</p>
                      <p className="text-sm text-blue-600 mt-2">{pharmacy.phone}</p>

                      {selectedPharmacy === pharmacy.id && (
                        <div className="mt-4 pt-4 border-t">
                          <input
                            type="text"
                            value={searchMedicine}
                            onChange={(e) => setSearchMedicine(e.target.value)}
                            placeholder="Search medicines..."
                            className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 mb-3 text-sm"
                          />
                          {medicines.length === 0 ? (
                            <p className="text-sm text-gray-500">No medicines available</p>
                          ) : (
                            <div className="space-y-2">
                              {medicines
                                .filter((m) =>
                                  m.medicine_name.toLowerCase().includes(searchMedicine.toLowerCase())
                                )
                                .map((medicine) => (
                                  <div key={medicine.id} className="text-sm p-2 bg-blue-50 rounded">
                                    <p className="font-medium text-gray-900">{medicine.medicine_name}</p>
                                    <p className="text-gray-600">
                                      Available: {medicine.quantity} | Rs. {medicine.unit_price}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}