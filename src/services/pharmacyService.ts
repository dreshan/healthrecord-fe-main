import { apiService } from './api';
import { Pharmacy, PharmacyInventory, CreateInventoryRequest, UpdateInventoryRequest } from '../types';

export const pharmacyService = {
  async getAllPharmacies(): Promise<Pharmacy[]> {
    return apiService.get<Pharmacy[]>('/pharmacies');
  },

  async getPharmacyById(id: number): Promise<Pharmacy> {
    return apiService.get<Pharmacy>(`/pharmacies/${id}`);
  },

  async getPharmacyInventory(pharmacyId: number): Promise<PharmacyInventory[]> {
    return apiService.get<PharmacyInventory[]>(`/pharmacies/${pharmacyId}/inventory`);
  },

  async searchMedicine(pharmacyId: number, medicineName: string): Promise<PharmacyInventory[]> {
    return apiService.get<PharmacyInventory[]>(
      `/pharmacies/${pharmacyId}/inventory/search?name=${encodeURIComponent(medicineName)}`
    );
  },

  async addInventoryItem(pharmacyId: number, data: CreateInventoryRequest): Promise<PharmacyInventory> {
    return apiService.post<PharmacyInventory>(`/pharmacies/${pharmacyId}/inventory`, data);
  },

  async updateInventoryItem(
    pharmacyId: number,
    itemId: number,
    data: UpdateInventoryRequest
  ): Promise<PharmacyInventory> {
    return apiService.put<PharmacyInventory>(`/pharmacies/${pharmacyId}/inventory/${itemId}`, data);
  },

  async deleteInventoryItem(pharmacyId: number, itemId: number): Promise<void> {
    return apiService.delete<void>(`/pharmacies/${pharmacyId}/inventory/${itemId}`);
  },

  async getMyPharmacyInventory(): Promise<PharmacyInventory[]> {
    return apiService.get<PharmacyInventory[]>('/pharmacy/inventory');
  },
};