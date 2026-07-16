import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { reviewApi } from '../lib/reviewApi'
import { Star, BadgeCheck, Trash2, Send, Loader2, AlertCircle,Flag,X } from 'lucide-react'

const COLORS = {
  forest:     '#0F5132',
  mint:       '#34D399',
  cream:      '#F9FAFB',
  card:       '#FFFFFF',
  border:     '#E5E7EB',
  ink:        '#111827',
  muted:      '#6B7280',
  red:        '#EF4444',
  redSoft:    '#FEF2F2',
  tint:       '#F0FDF4',
  orange:     '#D97706',
  orangeSoft: '#FEF3C7',
}

/* ── Star rating picker ───────────────────────────────────────────────────── */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            size={22}
            fill={(hover || value) >= n ? '#D97706' : 'none'}
            color={(hover || value) >= n ? '#D97706' : '#D1D5DB'}
          />
        </button>
      ))}
      {!value && (
        <span className="text-xs ml-1" style={{ color: COLORS.muted }}>
          Tap to rate
        </span>
      )}
    </div>
  )
}

/* ── Single review card ───────────────────────────────────────────────────── */
function ReviewCard({
  review,
  currentUserId,
  onDelete,
  reportingReviewId,
  reportReason,
  onOpenReport,
  onChangeReportReason,
  onSubmitReport,
  onCancelReport,
  reportLoading,
}) {
  const profile = review.profiles

  const initials = (
    profile?.full_name ||
    profile?.username ||
    'T'
  )
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isOwner =
    currentUserId &&
    String(currentUserId) ===
      String(review.user_id)

  const isReporting =
    reportingReviewId === review.id

  return (
    <article
      className="rounded-2xl border p-5"
      style={{
        borderColor: COLORS.border,
        background: COLORS.card,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Reviewer"
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{
                background: COLORS.forest,
              }}
            >
              {initials}
            </div>
          )}

          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: COLORS.ink }}
            >
              {profile?.full_name ||
                profile?.username ||
                'Traveler'}
            </p>

            <div className="mt-0.5 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <Star
                    key={index}
                    size={12}
                    fill={
                      index < review.rating
                        ? '#D97706'
                        : 'none'
                    }
                    color={
                      index < review.rating
                        ? '#D97706'
                        : '#D1D5DB'
                    }
                  />
                )
              )}

              <span
                className="ml-1 text-xs"
                style={{
                  color: COLORS.muted,
                }}
              >
                {review.rating}/5
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {review.visited && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background: COLORS.tint,
                color: COLORS.forest,
              }}
            >
              <BadgeCheck size={11} />
              Visited
            </span>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={() => onDelete(review.id)}
              title="Delete review"
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-red-50"
            >
              <Trash2
                size={13}
                color={COLORS.red}
              />
            </button>
          )}

          {currentUserId && !isOwner && (
            <button
              type="button"
              onClick={() =>
                onOpenReport(review.id)
              }
              title="Report review"
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-orange-50"
            >
              <Flag
                size={13}
                color={COLORS.orange}
              />
            </button>
          )}
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed"
        style={{ color: COLORS.ink }}
      >
        {review.comment}
      </p>

      <p
        className="mt-3 text-xs"
        style={{ color: COLORS.muted }}
      >
        {new Date(
          review.created_at
        ).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>

      {isReporting && (
        <div
          className="mt-4 rounded-xl border p-4"
          style={{
            borderColor: '#FED7AA',
            background: '#FFF7ED',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p
              className="text-sm font-semibold"
              style={{ color: COLORS.ink }}
            >
              Report this comment
            </p>

            <button
              type="button"
              onClick={onCancelReport}
              className="rounded-full p-1 hover:bg-orange-100"
            >
              <X
                size={15}
                color={COLORS.muted}
              />
            </button>
          </div>

          <select
            value={reportReason}
            onChange={(event) =>
              onChangeReportReason(
                event.target.value
              )
            }
            className="mb-3 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
            style={{
              borderColor: COLORS.border,
              color: COLORS.ink,
            }}
          >
            <option value="">
              Select a reason
            </option>

            <option value="Spam">
              Spam
            </option>

            <option value="Harassment">
              Harassment
            </option>
            <option value="False information">
              Illegal content
            </option>
            <option value="False information">
              Hate speech
            </option>

            <option value="Other">
              Other
            </option>
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={reportLoading}
              onClick={() =>
                onSubmitReport(review.id)
              }
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {reportLoading ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Reporting...
                </>
              ) : (
                <>
                  <Flag size={14} />
                  Submit report
                </>
              )}
            </button>

            <button
              type="button"
              disabled={reportLoading}
              onClick={onCancelReport}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
              style={{
                borderColor: COLORS.border,
                color: COLORS.muted,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

/* ── Main ReviewSection ───────────────────────────────────────────────────── */
function ReviewSection({ destinationId, user }) {
  const [reviews, setReviews]   = useState([])
  const [rating,  setRating]    = useState(0)
  const [comment, setComment]   = useState('')
  const [visited, setVisited]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error,   setError]     = useState('')
  const [posted,  setPosted]    = useState(false)
  const [reportingReviewId, setReportingReviewId] =useState(null)
  const [reportReason, setReportReason] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  const handleReportReview = async (reviewId) => {
  if (!user) {
    setError(
      'Please log in before reporting a review.'
    )
    return
  }

  if (!reportReason.trim()) {
    setError('Please provide a report reason.')
    return
  }

  try {
    setReportLoading(true)
    setError('')
    setReportMessage('')

    await reviewApi.report(
      reviewId,
      reportReason.trim()
    )

    setReportingReviewId(null)
    setReportReason('')

    setReportMessage(
      'The review was reported successfully.'
    )

    setTimeout(() => {
      setReportMessage('')
    }, 3000)
  } catch (error) {
    console.error('Report review error:', error)

    setError(
      error.response?.data?.message ||
        'Could not report this review.'
    )
  } finally {
    setReportLoading(false)
  }
}

  const loadReviews = async () => {
    setError('')
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, destination_id, user_id, rating,
        comment, visited, helpful_count, created_at,
        profiles ( username, full_name, avatar_url )
      `)
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setFetching(false)
      return
    }
    setReviews(data || [])
    setFetching(false)
  }

  useEffect(() => {
    if (destinationId) loadReviews()
  }, [destinationId])

  const saveReview = async (e) => {
    e.preventDefault()
    if (!user)          return setError('You must be logged in to leave a review.')
    if (!rating)        return setError('Please select a star rating.')
    if (!comment.trim()) return setError('Please write a comment.')

    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('reviews')
      .upsert(
        {
          destination_id: destinationId,
          user_id:        user.id,
          rating,
          comment:        comment.trim(),
          visited,
          updated_at:     new Date().toISOString(),
        },
        { onConflict: 'destination_id,user_id' }
      )

    setLoading(false)
    if (error) return setError(error.message)

    setComment('')
    setRating(0)
    setVisited(false)
    setPosted(true)
    setTimeout(() => setPosted(false), 3000)
    await loadReviews()
  }

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return
    setError('')
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id)

    if (error) return setError(error.message)
    await loadReviews()
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <section className="mt-10">
      {/* ── section header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: COLORS.mint }}
          >
            Share your experience
          </span>
          <h2
            className="text-2xl font-semibold mt-0.5"
            style={{ color: COLORS.ink, fontFamily: "'Playfair Display', serif" }}
          >
            Reviews
          </h2>
        </div>

        {avgRating && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{ background: COLORS.orangeSoft }}
          >
            <Star size={18} fill="#D97706" color="#D97706" />
            <span
              className="text-lg font-bold"
              style={{ color: COLORS.orange }}
            >
              {avgRating}
            </span>
            <span className="text-xs" style={{ color: COLORS.muted }}>
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* ── write a review form ── */}
      <form
        onSubmit={saveReview}
        className="rounded-3xl border p-6 mb-8"
        style={{ borderColor: COLORS.border, background: COLORS.card }}
      >
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: COLORS.ink }}
        >
          Write a review
        </p>

        {/* star picker */}
        <div className="mb-4">
          <label
            className="text-xs font-semibold block mb-2"
            style={{ color: COLORS.muted }}
          >
            YOUR RATING
          </label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* comment */}
        <div className="mb-4">
          <label
            className="text-xs font-semibold block mb-2"
            style={{ color: COLORS.muted }}
          >
            YOUR COMMENT
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 400))}
            placeholder="What was the visit like? Any tips for other travellers?"
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none transition-colors"
            style={{
              borderColor: COLORS.border,
              background:  COLORS.cream,
              color:       COLORS.ink,
            }}
          />
          <p className="text-xs mt-1 text-right" style={{ color: COLORS.muted }}>
            {comment.length} / 400
          </p>
        </div>

        {/* visited checkbox */}
        <label
          className="flex items-center gap-2 text-sm mb-5 cursor-pointer"
          style={{ color: COLORS.muted }}
        >
          <input
            type="checkbox"
            checked={visited}
            onChange={(e) => setVisited(e.target.checked)}
            className="accent-[#0F5132] w-4 h-4"
          />
          I have visited this destination
        </label>

        {/* error */}
        {error && (
          <div
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl mb-4"
            style={{ background: COLORS.redSoft, color: COLORS.red }}
          >
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* success */}
        {posted && (
          <div
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl mb-4"
            style={{ background: COLORS.tint, color: COLORS.forest }}
          >
            ✓ Review posted — thanks for sharing!
          </div>
        )}

        {/* submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
          style={{ background: COLORS.forest }}
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
            : <><Send size={14} /> Post review</>
          }
        </button>
      </form>

      {/* ── reviews list ── */}
      {reportMessage && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{
            background: COLORS.tint,
            color: COLORS.forest,
          }}
        >
          ✓ {reportMessage}
        </div>
      )}
      {fetching ? (
        <div className="text-center py-10">
          <Loader2
            size={24}
            className="animate-spin mx-auto"
            style={{ color: COLORS.muted }}
          />
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="text-center py-12 rounded-2xl border"
          style={{ borderColor: COLORS.border, color: COLORS.muted }}
        >
          <Star size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No reviews yet — be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              onDelete={deleteReview}
              reportingReviewId={reportingReviewId}
              reportReason={reportReason}
              reportLoading={reportLoading}
              onOpenReport={(reviewId) => {
                setReportingReviewId(reviewId)
                setReportReason('')
                setReportMessage('')
                setError('')
              }}
              onChangeReportReason={
                setReportReason
              }
              onSubmitReport={
                handleReportReview
              }
              onCancelReport={() => {
                setReportingReviewId(null)
                setReportReason('')
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ReviewSection