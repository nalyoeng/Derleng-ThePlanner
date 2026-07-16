import axios from 'axios';
import { supabase } from '../supabaseClient';

// VITE_API_URL should be:
// http://localhost:5000/api
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

// Remove a final slash to prevent URLs like /api//admin/users
const API_URL = BASE_URL.replace(/\/+$/, '');
// Get token from the current Supabase session
const getAuthHeader = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.access_token) {
    throw new Error('Not logged in.');
  }

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

  const res = await axios.get(
    `${API_URL}/admin/users`,
    { headers }
  );

  return res.data.users;
};

// ═══════════════════════════════════════════════════════════════
// CREATE ADMIN & REVOKE
// ═══════════════════════════════════════════════════════════════

export const createAdmin = async ({
  full_name,
  email,
  password,
  role,
}) => {
  const headers = await getAuthHeader();

  const res = await axios.post(
    `${API_URL}/admin/create`,
    {
      full_name,
      email,
      password,
      role,
    },
    { headers }
  );

  return res.data;
};

export const revokeAdmin = async (id) => {
  const headers = await getAuthHeader();

  const res = await axios.patch(
    `${API_URL}/admin/revoke/${id}`,
    {},
    { headers }
  );

  return res.data;
};

export const editAdminRole = async (
  id,
  newRole
) => {
  const headers = await getAuthHeader();

  const res = await axios.patch(
    `${API_URL}/admin/edit-role/${id}`,
    { newRole },
    { headers }
  );

  return res.data;
};

// ═══════════════════════════════════════════════════════════════
// DESTINATIONS
// ═══════════════════════════════════════════════════════════════

export const fetchAllDestinations = async () => {
  const headers = await getAuthHeader();

  const res = await axios.get(
    `${API_URL}/admin/destinations`,
    { headers }
  );

  return res.data.destinations;
};

export const createDestination = async (
  formData
) => {
  const headers = await getAuthHeader();

  const res = await axios.post(
    `${API_URL}/admin/destinations`,
    formData,
    { headers }
  );

  return res.data;
};

export const updateDestination = async (
  id,
  formData
) => {
  const headers = await getAuthHeader();

  const res = await axios.put(
    `${API_URL}/admin/destinations/${id}`,
    formData,
    { headers }
  );

  return res.data;
};

export const deleteDestination = async (id) => {
  const headers = await getAuthHeader();

  const res = await axios.delete(
    `${API_URL}/admin/destinations/${id}`,
    { headers }
  );

  return res.data;
};

// ═══════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════

export const fetchAllReports = async () => {
  const headers = await getAuthHeader();

  const res = await axios.get(
    `${API_URL}/admin/reports`,
    { headers }
  );

  return res.data.reports;
};

export const dismissReport = async (id) => {
  const headers = await getAuthHeader();

  const res = await axios.patch(
    `${API_URL}/admin/reports/${id}/dismiss`,
    {},
    { headers }
  );

  return res.data;
};

// ═══════════════════════════════════════════════════════════════
// BAN & RESTRICTIONS
// ═══════════════════════════════════════════════════════════════

export const banUser = async (
  id,
  ban_type,
  reason,
  report_id
) => {
  const headers = await getAuthHeader();

  const res = await axios.patch(
    `${API_URL}/admin/ban/${id}`,
    {
      ban_type,
      reason,
      report_id,
    },
    { headers }
  );

  return res.data;
};

export const restrictUser = async (
  id,
  duration,
  reason,
  report_id
) => {
  const headers = await getAuthHeader();

  const res = await axios.post(
    `${API_URL}/admin/restrict/${id}`,
    {
      duration,
      reason,
      report_id,
    },
    { headers }
  );

  return res.data;
};

export const liftRestriction = async (id) => {
  const headers = await getAuthHeader();

  const res = await axios.patch(
    `${API_URL}/admin/lift/${id}`,
    {},
    { headers }
  );

  return res.data;
};

export const fetchAllRestrictions = async () => {
  const headers = await getAuthHeader();

  const res = await axios.get(
    `${API_URL}/admin/restrictions`,
    { headers }
  );

  return res.data.restrictions;
};

// ═══════════════════════════════════════════════════════════════
// BACKUP & RECOVER
// ═══════════════════════════════════════════════════════════════

export const fetchBackups = async () => {
  const headers = await getAuthHeader();

  const res = await axios.get(
    `${API_URL}/admin/backups`,
    { headers }
  );

  return res.data.backups;
};

export const createBackup = async () => {
  const headers = await getAuthHeader();

  const res = await axios.post(
    `${API_URL}/admin/backup`,
    {},
    { headers }
  );

  return res.data;
};

export const restoreBackup = async (
  filename
) => {
  const headers = await getAuthHeader();

  const res = await axios.post(
    `${API_URL}/admin/recover`,
    { filename },
    { headers }
  );

  return res.data;
};