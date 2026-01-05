import { useState, useEffect } from 'react';
import { User, Prescription, PharmacyInventory, UpdatePrescriptionPharmacyInfoRequest } from '../types';
import { LogOut, Package, ShoppingCart, Save, DollarSign } from 'lucide-react';
import { prescriptionService } from '../services/prescriptionService';
import { pharmacyService } from '../services/pharmacyService';

interface PharmacistDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function PharmacistDashboard({ user, onLogout }: PharmacistDashboardProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'prescriptions'>('prescriptions');
  const [assignedPrescriptions, setAssignedPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<PharmacyInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPrescription, setUpdatingPrescription] = useState<string | null>(null);
  const [pharmacyNotes, setPharmacyNotes] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [medicineAvailability, setMedicineAvailability] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('[PharmacistDashboard] Starting to fetch data...');
      console.log('[PharmacistDashboard] User:', user);

      console.log('[PharmacistDashboard] Fetching assigned prescriptions...');
      const prescriptions = await prescriptionService.getAssignedPrescriptions();
      console.log('[PharmacistDashboard] Prescriptions received:', prescriptions);
      setAssignedPrescriptions(prescriptions);

      console.log('[PharmacistDashboard] Fetching inventory...');
      const inventoryData = await pharmacyService.getMyPharmacyInventory();
      console.log('[PharmacistDashboard] Inventory received:', inventoryData);
      setInventory(inventoryData || []);

      console.log('[PharmacistDashboard] Data fetch complete');
    } catch (error) {
      console.error('[PharmacistDashboard] Error fetching data:', error);
      if (error instanceof Error) {
        console.error('[PharmacistDashboard] Error message:', error.message);
        console.error('[PharmacistDashboard] Error stack:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrescriptionInfo = async (prescriptionId: string) => {
    console.log('[PharmacistDashboard] Starting update for prescription:', prescriptionId);
    console.log('[PharmacistDashboard] prescriptionService:', prescriptionService);
    console.log('[PharmacistDashboard] updatePharmacyInfo method:', prescriptionService.updatePharmacyInfo);

    if (!pharmacyNotes.trim()) {
      alert('Please provide pharmacy notes');
      return;
    }

    try {
      let availabilityData = null;
      if (medicineAvailability.trim()) {
        try {
          availabilityData = JSON.parse(medicineAvailability);
        } catch (e) {
          console.error('[PharmacistDashboard] JSON parse error:', e);
          alert('Invalid medicine availability JSON format');
          return;
        }
      }

      const requestData: UpdatePrescriptionPharmacyInfoRequest = {
        prescriptionId,
        pharmacyNotes,
        medicineAvailability: availabilityData,
        totalCost: totalCost ? parseFloat(totalCost) : undefined,
      };

      console.log('[PharmacistDashboard] Calling updatePharmacyInfo with:', requestData);
      const result = await prescriptionService.updatePharmacyInfo(requestData);
      console.log('[PharmacistDashboard] Update result:', result);

      setUpdatingPrescription(null);
      setPharmacyNotes('');
      setTotalCost('');
      setMedicineAvailability('');
      await fetchData();
      alert('Prescription information updated successfully!');
    } catch (error) {
      console.error('[PharmacistDashboard] Failed to update prescription info:', error);
      if (error instanceof Error) {
        console.error('[PharmacistDashboard] Error message:', error.message);
        console.error('[PharmacistDashboard] Error stack:', error.stack);
      }
      alert('Failed to update prescription information: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-600">HealthTrack - Pharmacist</h1>
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
              { id: 'prescriptions', label: 'Prescriptions', icon: ShoppingCart },
              { id: 'inventory', label: 'Manage Inventory', icon: Package },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === id
                    ? 'bg-teal-600 text-white border-b-2 border-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'prescriptions' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Assigned Prescriptions</h2>
                <p className="text-gray-600 mb-6">
                  These prescriptions have been assigned to your pharmacy by patients. Update availability and pricing information.
                </p>
                {assignedPrescriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No prescriptions assigned to your pharmacy yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {assignedPrescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300 hover:border-teal-400"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {prescription.diagnosis || 'Prescription'}
                            </h3>
                            {prescription.patient && (
                              <p className="text-sm text-gray-600">
                                Patient: {prescription.patient.fullName}
                              </p>
                            )}
                            {prescription.doctor && (
                              <p className="text-sm text-gray-600">
                                Prescribed by: Dr. {prescription.doctor.fullName}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              prescription.status === 'fulfilled'
                                ? 'bg-green-100 text-green-700'
                                : prescription.status === 'assigned'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {prescription.status}
                          </span>
                        </div>

                        {prescription.patient && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Patient Contact</p>
                            <p className="text-sm text-gray-700">Email: {prescription.patient.email}</p>
                            {prescription.patient.phone && (
                              <p className="text-sm text-gray-700">Phone: {prescription.patient.phone}</p>
                            )}
                          </div>
                        )}

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Prescription Details:</p>
                          {prescription.medications && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500">Medications:</p>
                              <p className="text-gray-700">{prescription.medications}</p>
                            </div>
                          )}
                          {prescription.dosage && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500">Dosage:</p>
                              <p className="text-gray-700">{prescription.dosage}</p>
                            </div>
                          )}
                          {prescription.instructions && (
                            <div>
                              <p className="text-xs text-gray-500">Instructions:</p>
                              <p className="text-gray-700">{prescription.instructions}</p>
                            </div>
                          )}
                        </div>

                        {prescription.pharmacyNotes && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-700">Your Notes:</p>
                            <p className="text-gray-700">{prescription.pharmacyNotes}</p>
                            {prescription.pharmacyUpdatedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Updated: {new Date(prescription.pharmacyUpdatedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {updatingPrescription === prescription.id ? (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pharmacy Notes * (Availability, pricing, etc.)
                              </label>
                              <textarea
                                value={pharmacyNotes}
                                onChange={(e) => setPharmacyNotes(e.target.value)}
                                placeholder="Enter notes about medicine availability, pricing, and other relevant information..."
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                                rows={4}
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Cost (Optional)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">Rs.</span>
                                <input
                                  type="number"
                                  value={totalCost}
                                  onChange={(e) => setTotalCost(e.target.value)}
                                  placeholder="0.00"
                                  step="0.01"
                                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medicine Availability JSON (Optional)
                              </label>
                              <textarea
                                value={medicineAvailability}
                                onChange={(e) => setMedicineAvailability(e.target.value)}
                                placeholder={'{"medicine1": "available", "medicine2": "out of stock"}'}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 font-mono text-sm"
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdatePrescriptionInfo(prescription.id)}
                                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                              >
                                <Save className="w-5 h-5" />
                                Save Update
                              </button>
                              <button
                                onClick={() => {
                                  setUpdatingPrescription(null);
                                  setPharmacyNotes('');
                                  setTotalCost('');
                                  setMedicineAvailability('');
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-all duration-300 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setUpdatingPrescription(prescription.id);
                              setPharmacyNotes(prescription.pharmacyNotes || '');
                              setTotalCost('');
                              setMedicineAvailability('');
                            }}
                            className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                          >
                            <DollarSign className="w-5 h-5" />
                            {prescription.pharmacyNotes ? 'Update Information' : 'Add Availability & Pricing'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pharmacy Inventory</h2>
                <p className="text-gray-600 mb-6">
                  Manage your pharmacy's medicine inventory.
                </p>
                {inventory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No inventory items yet. Use your Spring Boot backend to add inventory.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300"
                      >
                        <h3 className="font-semibold text-gray-900">{item.medicineName}</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            Quantity: <span className="font-medium">{item.quantity}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: <span className="font-medium">Rs. {item.unitPrice}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Last Updated: {new Date(item.lastUpdated).toLocaleString()}
                          </p>
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