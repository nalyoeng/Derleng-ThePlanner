import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Star, BadgeCheck, Trash2, Send, Loader2, AlertCircle } from 'lucide-react'

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
function ReviewCard({ review, currentUserId, onDelete }) {
  const profile  = review.profiles
  const initials = (profile?.full_name || profile?.username || 'T')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <article
      className="rounded-2xl border p-5"
      style={{ borderColor: COLORS.border, background: COLORS.card }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Reviewer"
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ background: COLORS.forest }}
            >
              {initials}
            </div>
          )}

          <div>
            <p className="text-sm font-semibold" style={{ color: COLORS.ink }}>
              {profile?.full_name || profile?.username || 'Traveler'}
            </p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < review.rating ? '#D97706' : 'none'}
                  color={i < review.rating ? '#D97706' : '#D1D5DB'}
                />
              ))}
              <span className="text-xs ml-1" style={{ color: COLORS.muted }}>
                {review.rating}/5
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {review.visited && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: COLORS.tint, color: COLORS.forest }}
            >
              <BadgeCheck size={11} /> Visited
            </span>
          )}
          {currentUserId === review.user_id && (
            <button
              type="button"
              onClick={() => onDelete(review.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} color={COLORS.red} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed" style={{ color: COLORS.ink }}>
        {review.comment}
      </p>

      <p className="mt-3 text-xs" style={{ color: COLORS.muted }}>
        {new Date(review.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        })}
      </p>
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

    if (error) { setError(error.message); return }
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
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ReviewSection