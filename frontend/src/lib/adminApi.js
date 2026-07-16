import axios from 'axios';
import { supabase } from '../supabaseClient';
 
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
 
// ── Get token from Supabase session automatically ────────────
const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not logged in.');
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
};
 
// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
export const fetchAllUsers = async () => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE_URL}/api/admin/users`, { headers });
  return res.data.users;
};
 
// ═══════════════════════════════════════════════════════════════
// CREATE ADMIN & REVOKE
// ═══════════════════════════════════════════════════════════════
export const createAdmin = async ({ full_name, email, password, role }) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE_URL}/api/admin/create`, { full_name, email, password, role }, { headers });
  return res.data;
};
 
export const revokeAdmin = async (id) => {
  const headers = await getAuthHeader();
  const res = await axios.patch(`${BASE_URL}/api/admin/revoke/${id}`, {}, { headers });
  return res.data;
};
 
export const editAdminRole = async (id, newRole) => {
  const headers = await getAuthHeader();
  const res = await axios.patch(`${BASE_URL}/api/admin/edit-role/${id}`, { newRole }, { headers });
  return res.data;
};
 
// ═══════════════════════════════════════════════════════════════
// DESTINATIONS
// ═══════════════════════════════════════════════════════════════
export const fetchAllDestinations = async () => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE_URL}/api/admin/destinations`, { headers });
  return res.data.destinations;
};
 
export const createDestination = async (formData) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE_URL}/api/admin/destinations`, formData, { headers });
  return res.data;
};
 
export const updateDestination = async (id, formData) => {
  const headers = await getAuthHeader();
  const res = await axios.put(`${BASE_URL}/api/admin/destinations/${id}`, formData, { headers });
  return res.data;
};
 
export const deleteDestination = async (id) => {
  const headers = await getAuthHeader();
  const res = await axios.delete(`${BASE_URL}/api/admin/destinations/${id}`, { headers });
  return res.data;
};
 
// ═══════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════
export const fetchAllReports = async () => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE_URL}/api/admin/reports`, { headers });
  return res.data.reports;
};
 
export const dismissReport = async (id) => {
  const headers = await getAuthHeader();
  const res = await axios.patch(`${BASE_URL}/api/admin/reports/${id}/dismiss`, {}, { headers });
  return res.data;
};
 
// ═══════════════════════════════════════════════════════════════
// BAN & RESTRICTIONS
// ═══════════════════════════════════════════════════════════════
export const banUser = async (id, ban_type, reason, report_id) => {
  const headers = await getAuthHeader();
  const res = await axios.patch(`${BASE_URL}/api/admin/ban/${id}`, { ban_type, reason, report_id }, { headers });
  return res.data;
};
 
export const restrictUser = async (id, duration, reason, report_id) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE_URL}/api/admin/restrict/${id}`, { duration, reason, report_id }, { headers });
  return res.data;
};
 
export const liftRestriction = async (id) => {
  const headers = await getAuthHeader();
  const res = await axios.patch(`${BASE_URL}/api/admin/lift/${id}`, {}, { headers });
  return res.data;
};
 
export const fetchAllRestrictions = async () => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE_URL}/api/admin/restrictions`, { headers });
  return res.data.restrictions;
};
// ═══════════════════════════════════════════════════════════════
// BACKUP & RECOVER
// ═══════════════════════════════════════════════════════════════
export const fetchBackups = async () => {
  const headers = await getAuthHeader();
  const res = await axios.get(`${BASE_URL}/api/admin/backups`, { headers });
  return res.data.backups;
};

export const createBackup = async () => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE_URL}/api/admin/backup`, {}, { headers });
  return res.data;
};

export const restoreBackup = async (filename) => {
  const headers = await getAuthHeader();
  const res = await axios.post(`${BASE_URL}/api/admin/recover`, { filename }, { headers });
  return res.data;
};