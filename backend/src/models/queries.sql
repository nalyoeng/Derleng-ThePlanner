-- ═══════════════════════════════════════════════════════════════
-- DER LENG — MEANINGFUL QUERIES
-- Database Administration Subject
-- ═══════════════════════════════════════════════════════════════


-- ─── 1. GET ALL USERS WITH THEIR ROLES ───────────────────────
SELECT id, full_name, email, role, ban_type, created_at
FROM profiles
ORDER BY created_at DESC;


-- ─── 2. GET ALL ACTIVE DESTINATIONS ──────────────────────────
SELECT id, name, location, categories, cost, rating
FROM destinations
WHERE status = 'Active'
ORDER BY rating DESC;


-- ─── 3. GET ALL PENDING REPORTS ──────────────────────────────
SELECT 
  r.id,
  p1.full_name AS reported_user,
  p2.full_name AS reported_by,
  r.content,
  r.reason,
  r.status,
  r.created_at
FROM reports r
JOIN profiles p1 ON r.reported_user_id = p1.id
JOIN profiles p2 ON r.reported_by_id = p2.id
WHERE r.status = 'Pending'
ORDER BY r.created_at DESC;


-- ─── 4. GET ALL BANNED USERS ─────────────────────────────────
SELECT full_name, email, ban_type, created_at
FROM profiles
WHERE ban_type != 'none'
ORDER BY created_at DESC;


-- ─── 5. GET ALL ACTIVE RESTRICTIONS ──────────────────────────
SELECT 
  p.full_name,
  p.email,
  res.type,
  res.reason,
  res.restricted_until,
  res.created_at
FROM restrictions res
JOIN profiles p ON res.user_id = p.id
WHERE res.is_active = TRUE
ORDER BY res.created_at DESC;


-- ─── 6. GET AUDIT LOG WITH NAMES ─────────────────────────────
SELECT 
  p1.full_name AS target_user,
  p2.full_name AS changed_by,
  a.old_role,
  a.new_role,
  a.action,
  a.created_at
FROM audit_log a
JOIN profiles p1 ON a.target_user_id = p1.id
JOIN profiles p2 ON a.changed_by_id = p2.id
ORDER BY a.created_at DESC;


-- ─── 7. GET DESTINATIONS BY CATEGORY ─────────────────────────
SELECT name, location, cost, rating
FROM destinations
WHERE 'Beach' = ANY(categories)
ORDER BY rating DESC;


-- ─── 8. COUNT REPORTS PER USER ───────────────────────────────
SELECT 
  p.full_name,
  p.email,
  COUNT(r.id) AS total_reports
FROM reports r
JOIN profiles p ON r.reported_user_id = p.id
GROUP BY p.full_name, p.email
ORDER BY total_reports DESC;


-- ─── 9. GET ALL ADMINS ───────────────────────────────────────
SELECT full_name, email, role, created_at
FROM profiles
WHERE role IN ('place_manager', 'moderator', 'super_admin')
ORDER BY role, created_at;


-- ─── 10. GET DESTINATIONS WITH COST BELOW $30 ────────────────
SELECT name, location, categories, cost, rating
FROM destinations
WHERE cost < 30
ORDER BY cost ASC;


-- ─── 11. GET ALL DESTINATIONS WITH CREATOR NAME ──────────────
SELECT 
  d.name,
  d.location,
  d.categories,
  d.cost,
  d.status,
  p.full_name AS created_by
FROM destinations d
JOIN profiles p ON d.created_by = p.id
ORDER BY d.created_at DESC;


-- ─── 12. GET RESTRICTION HISTORY FOR A SPECIFIC USER ─────────
SELECT 
  p.full_name,
  res.type,
  res.reason,
  res.restricted_until,
  res.is_active,
  res.created_at
FROM restrictions res
JOIN profiles p ON res.user_id = p.id
WHERE p.email = 'fake_99@temp.net'
ORDER BY res.created_at DESC;