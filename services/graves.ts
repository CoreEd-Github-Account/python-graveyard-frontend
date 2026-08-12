// services/graves.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type IdentificationType = "cnic" | "passport" | "nicop" | "other";

export interface GraveData {
  id: string;
  grave_id: number | null;
  old_grave_id: string | null;
  google_map_location: string | null;
  zone_id: string | null;
  deceased_name: string;
  deceased_surname: string | null;
  father_or_husband_name: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  date_buried: string | null;
  islamic_date_of_death: string | null;
  identification_type: IdentificationType | null;
  identification_number: string | null;
  gender: string | null;
  reason_of_death: string | null;
  neighbor_grave_id_1: number | null;
  neighbor_grave_id_2: number | null;
  native_place: string | null;
  created_at: string;
  updated_at: string;
}

export async function getGraves(): Promise<GraveData[]> {
  const response = await fetch(`${API_BASE_URL}/graves/`, {
    method: "GET",
  });
  
  if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail ?? "Failed to fetch graves.");
    }
    
  console.log("🚀 ~ getGraves ~ response:", response)
  return response.json();
}


export interface GraveWithInformerData {
  id: string;
  grave_id: number | null;
  old_grave_id: string | null;
  google_map_location: string | null;
  zone_id: string | null;
  deceased_name: string;
  deceased_surname: string | null;
  father_or_husband_name: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  date_buried: string | null;
  islamic_date_of_death: string | null;
  identification_type: IdentificationType | null;
  identification_number: string | null;
  gender: string | null;
  reason_of_death: string | null;
  neighbor_grave_id_1: number | null;
  neighbor_grave_id_2: number | null;
  native_place: string | null;
  created_at: string;
  informer_full_name: string | null;
  relationship_with_deceased: string | null;
  informer_cnic: string | null;
  informer_contact_number: string | null;
  additional_contact_number: string | null;
  informer_city: string | null;
  informer_country: string | null;
  form_received_by: string | null;
}


export interface GraveInformerDetailData {
  id: string;
  grave_id: number | null;
  old_grave_id: string | null;
  google_map_location: string | null;
  zone_id: string | null;
  deceased_name: string;
  deceased_surname: string | null;
  father_or_husband_name: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  date_buried: string | null;
  islamic_date_of_death: string | null;
  identification_type: IdentificationType | null;
  identification_number: string | null;
  gender: string | null;
  reason_of_death: string | null;
  neighbor_grave_id_1: number | null;
  neighbor_grave_id_2: number | null;
  native_place: string | null;
  created_at: string;
  updated_at: string;

  informer_id: string | null;
  informer_full_name: string | null;
  relationship_with_deceased: string | null;
  informer_cnic: string | null;
  informer_contact_number: string | null;
  additional_contact_number: string | null;
  informer_address: string | null;
  informer_city: string | null;
  informer_country: string | null;
  form_received_by: string | null;
}

export async function getGravesWithInformers(): Promise<GraveInformerDetailData[]> {
  const response = await fetch(`${API_BASE_URL}/graves/with-informers`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch graves.");
  }

  return response.json();
}




export interface GraveInformerUpdatePayload {
  grave_id?: number;
  old_grave_id?: string;
  google_map_location?: string;
  zone_id?: string;
  deceased_name?: string;
  deceased_surname?: string;
  father_or_husband_name?: string;
  date_of_birth?: string;
  date_of_death?: string;
  date_buried?: string;
  islamic_date_of_death?: string;
  identification_type?: IdentificationType;
  identification_number?: string;
  gender?: string;
  reason_of_death?: string;
  neighbor_grave_id_1?: number;
  neighbor_grave_id_2?: number;
  native_place?: string;

  informer_full_name?: string;
  relationship_with_deceased?: string;
  informer_cnic?: string;
  informer_contact_number?: string;
  additional_contact_number?: string;
  informer_address?: string;
  informer_city?: string;
  informer_country?: string;
  form_received_by?: string;
}

export async function getGraveWithInformer(id: string): Promise<GraveInformerDetailData> {
  const response = await fetch(`${API_BASE_URL}/graves/${id}/with-informer`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch grave.");
  }

  return response.json();
}

export async function updateGraveWithInformer(
  id: string,
  payload: GraveInformerUpdatePayload
): Promise<GraveInformerDetailData> {
  const response = await fetch(`${API_BASE_URL}/graves/${id}/with-informer`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to update grave.");
  }

  return response.json();
}


export async function deleteGrave(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/graves/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to delete grave.");
  }
}


export interface CreateGraveInformerPayload {
  grave_id?: number;
  old_grave_id?: string;
  google_map_location?: string;
  zone_id?: string;
  deceased_name: string;
  deceased_surname?: string;
  father_or_husband_name?: string;
  date_of_birth?: string;
  date_of_death?: string;
  date_buried?: string;
  islamic_date_of_death?: string;
  identification_type?: IdentificationType;
  identification_number?: string;
  gender?: string;
  reason_of_death?: string;
  native_place?: string;

  informer_full_name?: string;
  relationship_with_deceased?: string;
  informer_cnic?: string;
  informer_contact_number?: string;
  additional_contact_number?: string;
  informer_address?: string;
  informer_city?: string;
  informer_country?: string;
  form_received_by?: string;
}

export async function createGraveWithInformer(
  payload: CreateGraveInformerPayload
): Promise<GraveInformerDetailData> {
  const response = await fetch(`${API_BASE_URL}/graves/with-informer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to create grave record.");
  }

  return response.json();
}


export interface DeletedGraveWithInformerData {
  id: string;
  grave_id: number | null;
  old_grave_id: string | null;
  deceased_name: string;
  deceased_surname: string | null;
  father_or_husband_name: string | null;
  zone_id: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  identification_number: string | null;
  gender: string | null;
  native_place: string | null;
  created_at: string;
  deleted_at: string;
  informer_full_name: string | null;
  relationship_with_deceased: string | null;
  informer_cnic: string | null;
  informer_contact_number: string | null;
  additional_contact_number: string | null;
  informer_city: string | null;
  informer_country: string | null;
  form_received_by: string | null;
}

export async function getDeletedGraves(): Promise<DeletedGraveWithInformerData[]> {
  const response = await fetch(`${API_BASE_URL}/graves/deleted`, { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch deleted graves.");
  }

  return response.json();
}

export async function eraseGrave(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/graves/${id}/erase`, { method: "POST" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to erase grave.");
  }
}

export async function restoreGrave(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/graves/${id}/restore`, { method: "POST" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to restore grave.");
  }
}

export async function permanentDeleteGrave(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/graves/${id}/permanent`, { method: "DELETE" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to permanently delete grave.");
  }
}