const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Request failed: ${response.status}`);
  }

  return response.json();
}
export function getTables(year) {
  const query = year ? `?year=${year}` : '';
  return apiRequest(`/tables${query}`);
}
export function getTable(id, year) {
  const query = year ? `?year=${year}` : '';
  return apiRequest(`/tables/${id}${query}`);
}
export function createReservation(data){
  return apiRequest('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export function updateReservation(id, data) {
  return apiRequest(`/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function removeTableFromReservation(reservationId, tableId) {
  return apiRequest(`/reservations/${reservationId}/tables/${tableId}`, {
    method: 'DELETE',
  });
}export function addTablesToReservation(reservationId, tableIds) {
  return apiRequest(`/reservations/${reservationId}/tables`, {
    method: 'POST',
    body: JSON.stringify({ table_ids: tableIds }),
  });
}
export function getPrices() {
  return apiRequest('/prices');
}

export function setPrice(year, amountPerTable) {
  return apiRequest('/prices', {
    method: 'POST',
    body: JSON.stringify({ year, amount_per_table: amountPerTable }),
  });
}
export function getReservations(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/reservations${query ? `?${query}` : ''}`);
}

export function getYears() {
  return apiRequest('/reservations/years');
}
export function createTable(data) {
  return apiRequest('/tables', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}