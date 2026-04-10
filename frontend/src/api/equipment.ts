import { request } from './client';
import type {
  Equipment,
  EquipmentDetail,
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
} from '../types/api';

// ─── List ─────────────────────────────────────────────────────────────────────

export function listEquipment(params?: {
  type?: string;
  category?: string;
}): Promise<Equipment[]> {
  let qs = '';
  if (params) {
    const filtered = Object.entries(params).filter(([, v]) => v != null && v !== '') as [
      string,
      string,
    ][];
    if (filtered.length) qs = '?' + new URLSearchParams(filtered).toString();
  }
  return request<Equipment[]>(`/equipment${qs}`);
}

// ─── Get one ──────────────────────────────────────────────────────────────────

export function getEquipment(id: number): Promise<EquipmentDetail> {
  return request<EquipmentDetail>(`/equipment/${id}`);
}


export function createEquipment(data: CreateEquipmentRequest): Promise<Equipment> {
  return request<Equipment>('/equipment', { method: 'POST', body: data, auth: true });
}


export function updateEquipment(
  id: number,
  data: UpdateEquipmentRequest,
): Promise<Equipment> {
  return request<Equipment>(`/equipment/${id}`, {
    method: 'PUT',
    body: data,
    auth: true,
  });
}