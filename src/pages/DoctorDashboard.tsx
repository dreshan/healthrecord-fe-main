
import { useState, useEffect } from 'react';
import { User, Consultation, CreatePrescriptionRequest } from '../types';
import { LogOut, Users, MessageSquare, Calendar, CheckCircle, XCircle, Pill } from 'lucide-react';
import { consultationService } from '../services/consultationService';
import { userService } from '../services/userService';
import { prescriptionService } from '../services/prescriptionService';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions'>('appointments');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showClinicVisitForm, setShowClinicVisitForm] = useState(false);
  const [prescriptionConsultation, setPrescriptionConsultation] = useState<Consultation | null>(null);
  const [clinicVisitNotes, setClinicVisitNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consultationsData, patientsData] = await Promise.all([
        consultationService.getMyConsultations(),
        userService.getAllPatients(),
      ]);
      setConsultations(consultationsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConsultation = async (consultationId: number, status: string) => {
    try {
      await consultationService.updateConsultation(consultationId, {
        status: status as any,
        notes: notes || undefined,
      });
      setNotes('');
      setSelectedConsultation(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update consultation:', error);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const prescriptionData: CreatePrescriptionRequest = {
        patientId: selectedPatient,
        medications: medications || undefined,
        dosage: dosage || undefined,
        diagnosis: diagnosis || undefined,
        instructions: instructions || undefined,
        isClinicVisit: false,
      };

      await prescriptionService.createPrescription(prescriptionData);

      setSelectedPatient('');
      setDiagnosis('');
      setMedications('');
      setDosage('');
      setInstructions('');

      alert('Prescription created successfully!');
    } catch (error) {
      console.error('Failed to create prescription:', error);
      alert('Failed to create prescription');
    }
  };

  const handleCreatePrescriptionFromConsultation = (consultation: Consultation) => {
    setPrescriptionConsultation(consultation);
    setDiagnosis('');
    setMedications('');
    setDosage('');
    setInstructions('');
    setShowPrescriptionForm(true);
  };

  const handleSubmitPrescriptionFromConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionConsultation) return;

    try {
      await prescriptionService.createPrescription({
        consultationId: prescriptionConsultation.id,
        patientId: prescriptionConsultation.patientId,
        medications: medications || undefined,
        dosage: dosage || undefined,
        diagnosis: diagnosis || undefined,
        instructions: instructions || undefined,
        isClinicVisit: false,
      });

      alert('Prescription created successfully! Patient can now view it in their Prescriptions tab.');
      setShowPrescriptionForm(false);
      setPrescriptionConsultation(null);
      setDiagnosis('');
      setMedications('');
      setDosage('');
      setInstructions('');
      await fetchData();
    } catch (error) {
      console.error('Failed to create prescription:', error);
      alert('Failed to create prescription. Please try again.');
    }
  };

  const handleRequestClinicVisit = (consultation: Consultation) => {
    setPrescriptionConsultation(consultation);
    setClinicVisitNotes('');
    setShowClinicVisitForm(true);
  };

  const handleSubmitClinicVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionConsultation || !clinicVisitNotes.trim()) return;

    try {
      await prescriptionService.requestClinicVisit({
        consultationId: prescriptionConsultation.id,
        patientId: prescriptionConsultation.patientId,
        notes: clinicVisitNotes,
      });

      alert('Clinic visit request sent successfully! Patient can view it in their Prescriptions tab.');
      setShowClinicVisitForm(false);
      setPrescriptionConsultation(null);
      setClinicVisitNotes('');
      await fetchData();
    } catch (error) {
      console.error('Failed to request clinic visit:', error);
      alert('Failed to request clinic visit. Please try again.');
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {showPrescriptionForm && prescriptionConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Prescription</h2>
              <button
                onClick={() => {
                  setShowPrescriptionForm(false);
                  setPrescriptionConsultation(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPrescriptionFromConsultation} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Patient Information</p>
                <p className="text-gray-900 font-medium">
                  {prescriptionConsultation.patient?.fullName || prescriptionConsultation.patientName || 'Unknown Patient'}
                </p>
                {prescriptionConsultation.patient?.email && (
                  <p className="text-sm text-gray-600">
                    {prescriptionConsultation.patient.email}
                  </p>
                )}
                {prescriptionConsultation.patient?.phone && (
                  <p className="text-sm text-gray-600">
                    Phone: {prescriptionConsultation.patient.phone}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Patient Symptoms</p>
                <p className="text-gray-700">
                  {prescriptionConsultation.symptoms || prescriptionConsultation.message || 'No symptoms provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g., Common Cold, Hypertension, Diabetes"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medications <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="List medications (e.g., Amoxicillin, Ibuprofen, Paracetamol)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage Instructions <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., Amoxicillin 500mg three times daily for 7 days&#10;Ibuprofen 400mg as needed for pain"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Special instructions (e.g., Take with food, Avoid alcohol, Drink plenty of water)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionForm(false);
                    setPrescriptionConsultation(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Pill className="w-5 h-5" />
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClinicVisitForm && prescriptionConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold">Request Clinic Visit</h2>
              <button
                onClick={() => {
                  setShowClinicVisitForm(false);
                  setPrescriptionConsultation(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitClinicVisit} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Patient Information</p>
                <p className="text-gray-900 font-medium">
                  {prescriptionConsultation.patient?.fullName || prescriptionConsultation.patientName || 'Unknown Patient'}
                </p>
                {prescriptionConsultation.patient?.email && (
                  <p className="text-sm text-gray-600">
                    {prescriptionConsultation.patient.email}
                  </p>
                )}
                {prescriptionConsultation.patient?.phone && (
                  <p className="text-sm text-gray-600">
                    Phone: {prescriptionConsultation.patient.phone}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Patient Symptoms</p>
                <p className="text-gray-700">
                  {prescriptionConsultation.symptoms || prescriptionConsultation.message || 'No symptoms provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Visit Instructions <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={clinicVisitNotes}
                  onChange={(e) => setClinicVisitNotes(e.target.value)}
                  placeholder="Enter instructions for the patient's clinic visit (e.g., Please come to the clinic for a physical examination on [date]. Bring your medical history and any previous test results.)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={5}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  The patient will receive these instructions and can schedule an appointment.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowClinicVisitForm(false);
                    setPrescriptionConsultation(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">HealthTrack - Doctor</h1>
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
          <div className="grid grid-cols-2 border-b">
            {[
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'prescriptions', label: 'Issue Prescription', icon: Pill },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === id
                    ? 'bg-green-600 text-white border-b-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'appointments' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Your Patient Appointments
                </h2>
                <p className="text-gray-600 mb-6">
                  These are consultations specifically assigned to you. Review patient information and either create a prescription or request a clinic visit.
                </p>
                {consultations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No appointments assigned to you yet</p>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300 hover:border-green-400"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              Patient: {consultation.patient?.fullName || consultation.patientName || 'Unknown'}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
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
                            {consultation.status === 'visit_clinic' ? 'Clinic Visit' : consultation.status}
                          </span>
                        </div>

                        {consultation.patient && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Patient Information</p>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Email:</span> {consultation.patient.email}
                              </p>
                              {consultation.patient.phone && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Phone:</span> {consultation.patient.phone}
                                </p>
                              )}
                              {consultation.patient.address && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Address:</span> {consultation.patient.address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Patient Symptoms & Concerns:</p>
                          <p className="text-gray-600 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            {consultation.symptoms || consultation.message || 'No symptoms provided'}
                          </p>
                        </div>

                        {consultation.notes && (
                          <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                            <p className="text-sm font-medium text-green-700">Your Notes:</p>
                            <p className="text-gray-700">{consultation.notes}</p>
                          </div>
                        )}

                        {consultation.status === 'pending' && (
                          <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <button
                                onClick={() => handleCreatePrescriptionFromConsultation(consultation)}
                                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                              >
                                <Pill className="w-5 h-5" />
                                Create Prescription
                              </button>
                              <button
                                onClick={() => handleRequestClinicVisit(consultation)}
                                className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                              >
                                <Users className="w-5 h-5" />
                                Request Clinic Visit
                              </button>
                            </div>
                            <button
                              onClick={() => handleUpdateConsultation(consultation.id, 'cancelled')}
                              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel Appointment
                            </button>
                          </div>
                        )}

                        {consultation.status !== 'pending' && (
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-600 text-center">
                              This consultation has been {consultation.status.replace('_', ' ')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Prescription</h2>
                <form onSubmit={handleCreatePrescription} className="space-y-4 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient *</label>
                    <select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                      required
                    >
                      <option value="">Choose a patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.fullName} - {patient.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g., Common Cold, Hypertension"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
                    <textarea
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="List of medications (e.g., Amoxicillin, Ibuprofen, Paracetamol)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage Instructions</label>
                    <textarea
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g., Amoxicillin 500mg three times daily, Ibuprofen 400mg as needed"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instructions</label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Special instructions for the patient (e.g., Take with food, Avoid alcohol)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Pill className="w-5 h-5" />
                    Create Prescription
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
