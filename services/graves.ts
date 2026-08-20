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

// Fields the PUBLIC search endpoint (/graves/search) accepts. Kept in
// sync with SEARCHABLE_FIELDS in app/controllers/grave_controller.py.
export type GraveSearchField =
  | "deceased_name"
  | "deceased_surname"
  | "father_or_husband_name"
  | "gender"
  | "date_of_death";

export interface GravePaginatedResponse {
  items: GraveData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function searchGraves(params: {
  searchField: GraveSearchField;
  searchTerm: string;
  page?: number;
  pageSize?: number;
}): Promise<GravePaginatedResponse> {
  const { searchField, searchTerm, page = 1, pageSize = 20 } = params;

  const query = new URLSearchParams({
    search_field: searchField,
    search_term: searchTerm,
    page: String(page),
    page_size: String(pageSize),
  });

  const response = await fetch(`${API_BASE_URL}/graves/search?${query.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to search graves.");
  }

  return response.json();
}

// Public-facing type-ahead suggestions (/graves/suggestions) - reuses the
// same GraveSuggestionField shape as the admin suggestions endpoint, since
// both only ever support "deceased_name" | "deceased_surname".
export async function getPublicGraveSuggestions(params: {
  searchField: "deceased_name" | "deceased_surname";
  searchTerm: string;
  limit?: number;
}): Promise<string[]> {
  const { searchField, searchTerm, limit = 8 } = params;

  const query = new URLSearchParams({
    search_field: searchField,
    search_term: searchTerm,
    limit: String(limit),
  });

  const response = await fetch(`${API_BASE_URL}/graves/suggestions?${query.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    // Fail quietly - a suggestion dropdown not loading shouldn't show an
    // error banner on the page.
    return [];
  }

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

export async function getGravesWithInformers(): Promise<GraveWithInformerData[]> {
  const response = await fetch(`${API_BASE_URL}/graves/with-informers`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch graves.");
  }

  return response.json();
}

// Fields the ADMIN search bar (/admin/super-admin/graves/view) accepts.
// Kept in sync with ADMIN_SEARCH_FIELDS in app/controllers/grave_controller.py.
export type AdminGraveSearchField =
  | "deceased_name"
  | "deceased_surname"
  | "father_or_husband_name"
  | "gender"
  | "identification_number"
  | "date_of_death"
  | "date_buried"
  | "grave_id"
  | "zone_id"
  | "informer_full_name"
  | "informer_cnic";

export interface GraveWithInformerPaginatedResponse {
  items: GraveWithInformerData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function searchGravesWithInformers(params: {
  searchField?: AdminGraveSearchField;
  searchTerm?: string;
  searchTermTo?: string;
  page?: number;
  pageSize?: number;
}): Promise<GraveWithInformerPaginatedResponse> {
  const { searchField, searchTerm, searchTermTo, page = 1, pageSize = 20 } = params;

  const query = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  // search_field/search_term are optional - admin view shows everything
  // (paginated) when neither is set. search_term_to is only meaningful
  // for date_of_death/date_buried, turning the match into a range.
  if (searchField && searchTerm) {
    query.set("search_field", searchField);
    query.set("search_term", searchTerm);
    if (searchTermTo) {
      query.set("search_term_to", searchTermTo);
    }
  }

  const response = await fetch(`${API_BASE_URL}/graves/with-informers/search?${query.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? "Failed to fetch graves.");
  }

  return response.json();
}

// Fields the type-ahead suggestion dropdown supports - a small subset of
// AdminGraveSearchField. Kept in sync with SUGGESTION_FIELDS in
// app/controllers/grave_controller.py.
export type GraveSuggestionField = "deceased_name" | "deceased_surname";

export async function getGraveSearchSuggestions(params: {
  searchField: GraveSuggestionField;
  searchTerm: string;
  limit?: number;
}): Promise<string[]> {
  const { searchField, searchTerm, limit = 8 } = params;

  const query = new URLSearchParams({
    search_field: searchField,
    search_term: searchTerm,
    limit: String(limit),
  });

  const response = await fetch(`${API_BASE_URL}/graves/with-informers/suggestions?${query.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    // Suggestions are a nice-to-have - fail quietly rather than surfacing
    // an error banner just because the dropdown couldn't load.
    return [];
  }

  return response.json();
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