import { API_BASE_URL } from '../firebase/config';

const getUrl = (endpoint: string) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  return `${base}/${path}`;
};

export async function fetchHealth() {
  const res = await fetch(getUrl('/health'));
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function uploadLogisticsDataApi(formData: FormData) {
  const res = await fetch(getUrl('/upload/logistics-data'), {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Failed to upload logistics data');
  }
  return res.json();
}

export async function clearDataApi() {
  const res = await fetch(getUrl('/clear-data'), {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to clear data');
  return res.json();
}

export async function fetchRiskSummary() {
  const res = await fetch(getUrl('/risk-summary'));
  if (!res.ok) throw new Error('Failed to fetch risk summary');
  return res.json();
}

export async function fetchOrders(riskFilter?: string) {
  const endpoint = riskFilter ? `/orders?risk=${riskFilter}` : '/orders';
  const res = await fetch(getUrl(endpoint));
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrderDetails(id: string) {
  const res = await fetch(getUrl(`/orders/${id}`));
  if (!res.ok) throw new Error(`Order ${id} not found`);
  return res.json();
}

export async function createOrderApi(payload: any) {
  const res = await fetch(getUrl('/orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

export async function createCustomerApi(payload: any) {
  const res = await fetch(getUrl('/customers'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
}

export async function createVehicleApi(payload: any) {
  const res = await fetch(getUrl('/vehicles'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create vehicle');
  return res.json();
}

export async function createDriverApi(payload: any) {
  const res = await fetch(getUrl('/drivers'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create driver');
  return res.json();
}

export async function createPackageApi(payload: any) {
  const res = await fetch(getUrl('/packages'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create package');
  return res.json();
}

export async function fetchCustomers() {
  const res = await fetch(getUrl('/customers'));
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function fetchCustomerDetails(id: string) {
  const res = await fetch(getUrl(`/customers/${id}`));
  if (!res.ok) throw new Error('Failed to fetch customer details');
  return res.json();
}

export async function fetchVehicles() {
  const res = await fetch(getUrl('/vehicles'));
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function fetchDrivers() {
  const res = await fetch(getUrl('/drivers'));
  if (!res.ok) throw new Error('Failed to fetch drivers');
  return res.json();
}

export async function fetchPackages() {
  const res = await fetch(getUrl('/packages'));
  if (!res.ok) throw new Error('Failed to fetch packages');
  return res.json();
}

export async function fetchInsights() {
  const res = await fetch(getUrl('/insights'));
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}

export async function applyRecommendation(orderId: string) {
  const res = await fetch(getUrl(`/orders/${orderId}/apply-recommendation`), {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to apply recommendation');
  return res.json();
}

export async function runSimulation(payload: {
  orderId: string;
  requestedWindow?: string;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  priority?: string;
  customerWindowOverride?: string;
}) {
  const res = await fetch(getUrl('/simulate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}

export async function askCopilot(query: string) {
  const res = await fetch(getUrl('/copilot/query'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to query Copilot');
  return res.json();
}

export async function fetchTop5Recommendations() {
  const res = await fetch(getUrl('/api/recommendations/top-5'));
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function prioritizeOrderApi(orderId: string) {
  const res = await fetch(getUrl(`/api/orders/${orderId}/prioritize`), {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to prioritize order');
  return res.json();
}
