import { foods as _foods, requests as _requests } from '../mockData';

let foods = JSON.parse(JSON.stringify(_foods));
let requests = JSON.parse(JSON.stringify(_requests));

export function listFoods() {
  return new Promise((res) => setTimeout(() => res(foods), 300));
}

export function getFoodById(id) {
  return new Promise((res) => setTimeout(() => res(foods.find((f) => f.id === id) || null), 200));
}

export function listRequests() {
  return new Promise((res) => setTimeout(() => res(requests), 200));
}

export function createRequest(data) {
  const id = 'r' + (requests.length + 1);
  const newReq = { id, ...data, requestDate: new Date().toISOString(), status: 'Requested' };
  requests.unshift(newReq);
  return new Promise((res) => setTimeout(() => res(newReq), 300));
}

export function cancelRequest(id) {
  requests = requests.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r));
  return Promise.resolve({ ok: true });
}
