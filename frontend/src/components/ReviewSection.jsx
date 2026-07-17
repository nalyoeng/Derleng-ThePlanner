import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BadgeCheck,
  Edit3,
  Flag,
  Loader2,
  Send,
  Star,
  Trash2,
  X,
} from 'lucide-react'

import { reviewApi } from '../lib/reviewApi'

const COLORS = {
  forest: '#0F5132',
  mint: '#34D399',
  cream: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  ink: '#111827',
  muted: '#6B7280',
  red: '#EF4444',
  redSoft: '#FEF2F2',
  tint: '#F0FDF4',
  orange: '#D97706',
  orangeSoft: '#FEF3C7',
}

const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Hate speech',
  'Misinformation',
  'Illegal content',
  'Other',
]

function getProfile(review) {
  if (Array.isArray(review?.profiles)) {
    return review.profiles[0] || null
  }

  return (
    review?.profiles ||
    review?.profile ||
    review?.user ||
    null
  )
}

function getInitials(profile) {
  const name =
    profile?.full_name ||
    profile?.username ||
    'Traveler'

  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function normalizeReviews(result) {
  if (Array.isArray(result)) {
    return result
  }

  if (Array.isArray(result?.data)) {
    return result.data
  }

  if (Array.isArray(result?.reviews)) {
    return result.reviews
  }

  if (Array.isArray(result?.data?.reviews)) {
    return result.data.reviews
  }

  return []
}

function StarPicker({
  value,
  onChange,
  disabled = false,
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((number) => (
        <button
          key={number}
          type="button"
          disabled={disabled}
          onClick={() => onChange(number)}
          onMouseEnter={() => {
            if (!disabled) {
              setHover(number)
            }
          }}
          onMouseLeave={() => setHover(0)}
          className="disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`${number} star${
            number !== 1 ? 's' : ''
          }`}
        >
          <Star
            size={22}
            fill={
              (hover || value) >= number
                ? COLORS.orange
                : 'none'
            }
            color={
              (hover || value) >= number
                ? COLORS.orange
                : '#D1D5DB'
            }
          />
        </button>
      ))}

      {!value && (
        <span
          className="ml-1 text-xs"
          style={{ color: COLORS.muted }}
        >
          Tap to rate
        </span>
      )}
    </div>
  )
}

function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
  deletingId,
  reportingReviewId,
  reportReason,
  reportLoading,
  onOpenReport,
  onChangeReportReason,
  onSubmitReport,
  onCancelReport,
}) {
  const profile = getProfile(review)
  const initials = getInitials(profile)

  const isOwner =
    currentUserId &&
    String(currentUserId) ===
      String(review.user_id)

  const isReporting =
    reportingReviewId === review.id

  const isDeleting =
    deletingId === review.id

  const createdDate = review.created_at
    ? new Date(review.created_at)
    : null

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
              alt={
                profile.full_name ||
                profile.username ||
                'Reviewer'
              }
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
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Star
                  key={index}
                  size={12}
                  fill={
                    index < Number(review.rating)
                      ? COLORS.orange
                      : 'none'
                  }
                  color={
                    index < Number(review.rating)
                      ? COLORS.orange
                      : '#D1D5DB'
                  }
                />
              ))}

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
            <>
              <button
                type="button"
                onClick={() => onEdit(review)}
                title="Edit review"
                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-green-50"
              >
                <Edit3
                  size={13}
                  color={COLORS.forest}
                />
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() =>
                  onDelete(review.id)
                }
                title="Delete review"
                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                {isDeleting ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                    color={COLORS.red}
                  />
                ) : (
                  <Trash2
                    size={13}
                    color={COLORS.red}
                  />
                )}
              </button>
            </>
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
        className="mt-3 whitespace-pre-wrap text-sm leading-relaxed"
        style={{ color: COLORS.ink }}
      >
        {review.comment ||
          'No written comment.'}
      </p>

      <p
        className="mt-3 text-xs"
        style={{ color: COLORS.muted }}
      >
        {createdDate &&
        !Number.isNaN(createdDate.getTime())
          ? createdDate.toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }
            )
          : 'Date unavailable'}
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
              Report this review
            </p>

            <button
              type="button"
              disabled={reportLoading}
              onClick={onCancelReport}
              className="rounded-full p-1 hover:bg-orange-100 disabled:opacity-60"
            >
              <X
                size={15}
                color={COLORS.muted}
              />
            </button>
          </div>

          <select
            value={reportReason}
            disabled={reportLoading}
            onChange={(event) =>
              onChangeReportReason(
                event.target.value
              )
            }
            className="mb-3 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none disabled:opacity-60"
            style={{
              borderColor: COLORS.border,
              color: COLORS.ink,
            }}
          >
            <option value="">
              Select a reason
            </option>

            {REPORT_REASONS.map((reason) => (
              <option
                key={reason}
                value={reason}
              >
                {reason}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                reportLoading ||
                !reportReason
              }
              onClick={() =>
                onSubmitReport(review.id)
              }
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
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

function ReviewSection({
  destinationId,
  user,
}) {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [visited, setVisited] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [fetching, setFetching] =
    useState(true)

  const [deletingId, setDeletingId] =
    useState(null)

  const [editingReviewId, setEditingReviewId] =
    useState(null)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] =
    useState('')

  const [
    reportingReviewId,
    setReportingReviewId,
  ] = useState(null)

  const [reportReason, setReportReason] =
    useState('')

  const [reportLoading, setReportLoading] =
    useState(false)

  const currentUserId = user?.id || null

  const myReview = useMemo(() => {
    if (!currentUserId) {
      return null
    }

    return (
      reviews.find(
        (review) =>
          String(review.user_id) ===
          String(currentUserId)
      ) || null
    )
  }, [reviews, currentUserId])

  const avgRating = useMemo(() => {
    if (reviews.length === 0) {
      return null
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    )

    return (
      total / reviews.length
    ).toFixed(1)
  }, [reviews])

  const showSuccess = (message) => {
    setSuccessMessage(message)

    window.setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  const resetForm = () => {
    setRating(0)
    setComment('')
    setVisited(false)
    setEditingReviewId(null)
  }

  const loadReviews = useCallback(async () => {
    if (!destinationId) {
      setReviews([])
      setFetching(false)
      return
    }

    try {
      setFetching(true)
      setError('')

      const result =
        await reviewApi.getForDestination(
          destinationId
        )

      setReviews(normalizeReviews(result))
    } catch (requestError) {
      console.error(
        'Load reviews error:',
        requestError.response?.data ||
          requestError
      )

      setReviews([])

      setError(
        requestError.response?.data
          ?.message ||
          'Could not load reviews.'
      )
    } finally {
      setFetching(false)
    }
  }, [destinationId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const handleEdit = (review) => {
    setEditingReviewId(review.id)
    setRating(Number(review.rating) || 0)
    setComment(review.comment || '')
    setVisited(Boolean(review.visited))
    setError('')
    setSuccessMessage('')

    document
      .getElementById('review-form')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
  }

  const saveReview = async (event) => {
    event.preventDefault()

    if (!user) {
      setError(
        'You must be logged in to leave a review.'
      )
      return
    }

    if (!rating) {
      setError(
        'Please select a star rating.'
      )
      return
    }

    if (!comment.trim()) {
      setError(
        'Please write a comment.'
      )
      return
    }

    if (comment.trim().length > 400) {
      setError(
        'Comment cannot exceed 400 characters.'
      )
      return
    }

    const existingReviewId =
      editingReviewId || myReview?.id

    try {
      setSubmitting(true)
      setError('')
      setSuccessMessage('')

      const payload = {
        rating,
        comment: comment.trim(),
        visited,
      }

      if (existingReviewId) {
        await reviewApi.update(
          existingReviewId,
          payload
        )

        showSuccess(
          'Your review was updated successfully.'
        )
      } else {
        await reviewApi.create(
          destinationId,
          payload
        )

        showSuccess(
          'Review posted — thanks for sharing!'
        )
      }

      resetForm()
      await loadReviews()
    } catch (requestError) {
      console.error(
        'Save review error:',
        requestError.response?.data ||
          requestError
      )

      const code =
        requestError.response?.data?.code

      if (
        code ===
        'ACCOUNT_COMMENT_BANNED'
      ) {
        setError(
          requestError.response.data.message ||
            'You are not allowed to post reviews.'
        )
      } else if (
        code === 'ACCOUNT_RESTRICTED'
      ) {
        setError(
          requestError.response.data.message ||
            'Your account is temporarily restricted.'
        )
      } else {
        setError(
          requestError.response?.data
            ?.message ||
            'Could not save your review.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const deleteReview = async (
    reviewId
  ) => {
    const confirmed = window.confirm(
      'Delete your review?'
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(reviewId)
      setError('')
      setSuccessMessage('')

      await reviewApi.remove(reviewId)

      if (editingReviewId === reviewId) {
        resetForm()
      }

      showSuccess(
        'Your review was deleted.'
      )

      await loadReviews()
    } catch (requestError) {
      console.error(
        'Delete review error:',
        requestError.response?.data ||
          requestError
      )

      setError(
        requestError.response?.data
          ?.message ||
          'Could not delete your review.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleReportReview = async (
    reviewId
  ) => {
    if (!user) {
      setError(
        'Please log in before reporting a review.'
      )
      return
    }

    if (!reportReason) {
      setError(
        'Please select a report reason.'
      )
      return
    }

    try {
      setReportLoading(true)
      setError('')
      setSuccessMessage('')

      await reviewApi.report(
        reviewId,
        reportReason
      )

      setReportingReviewId(null)
      setReportReason('')

      showSuccess(
        'The review was reported successfully.'
      )
    } catch (requestError) {
      console.error(
        'Report review error:',
        requestError.response?.data ||
          requestError
      )

      setError(
        requestError.response?.data
          ?.message ||
          'Could not report this review.'
      )
    } finally {
      setReportLoading(false)
    }
  }

  const isUpdating =
    Boolean(editingReviewId) ||
    Boolean(myReview)

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: COLORS.mint }}
          >
            Share your experience
          </span>

          <h2
            className="mt-0.5 text-2xl font-semibold"
            style={{
              color: COLORS.ink,
              fontFamily:
                "'Playfair Display', serif",
            }}
          >
            Reviews
          </h2>
        </div>

        {avgRating && (
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2"
            style={{
              background:
                COLORS.orangeSoft,
            }}
          >
            <Star
              size={18}
              fill={COLORS.orange}
              color={COLORS.orange}
            />

            <span
              className="text-lg font-bold"
              style={{
                color: COLORS.orange,
              }}
            >
              {avgRating}
            </span>

            <span
              className="text-xs"
              style={{
                color: COLORS.muted,
              }}
            >
              ({reviews.length}{' '}
              review
              {reviews.length !== 1
                ? 's'
                : ''}
              )
            </span>
          </div>
        )}
      </div>

      <form
        id="review-form"
        onSubmit={saveReview}
        className="mb-8 rounded-3xl border p-6"
        style={{
          borderColor: COLORS.border,
          background: COLORS.card,
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p
            className="text-sm font-semibold"
            style={{ color: COLORS.ink }}
          >
            {isUpdating
              ? 'Update your review'
              : 'Write a review'}
          </p>

          {editingReviewId && (
            <button
              type="button"
              disabled={submitting}
              onClick={resetForm}
              className="flex items-center gap-1 text-xs font-semibold disabled:opacity-60"
              style={{
                color: COLORS.muted,
              }}
            >
              <X size={13} />
              Cancel edit
            </button>
          )}
        </div>

        {myReview &&
          !editingReviewId && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{
                background: COLORS.tint,
                color: COLORS.forest,
              }}
            >
              You already reviewed this
              destination. Submitting this form
              will update your existing review.
            </div>
          )}

        <div className="mb-4">
          <label
            className="mb-2 block text-xs font-semibold"
            style={{ color: COLORS.muted }}
          >
            YOUR RATING
          </label>

          <StarPicker
            value={rating}
            onChange={setRating}
            disabled={submitting}
          />
        </div>

        <div className="mb-4">
          <label
            className="mb-2 block text-xs font-semibold"
            style={{ color: COLORS.muted }}
          >
            YOUR COMMENT
          </label>

          <textarea
            value={comment}
            disabled={submitting}
            onChange={(event) =>
              setComment(
                event.target.value.slice(
                  0,
                  400
                )
              )
            }
            placeholder="What was the visit like? Any tips for other travellers?"
            rows={4}
            className="w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: COLORS.border,
              background: COLORS.cream,
              color: COLORS.ink,
            }}
          />

          <p
            className="mt-1 text-right text-xs"
            style={{ color: COLORS.muted }}
          >
            {comment.length} / 400
          </p>
        </div>

        <label
          className="mb-5 flex cursor-pointer items-center gap-2 text-sm"
          style={{ color: COLORS.muted }}
        >
          <input
            type="checkbox"
            checked={visited}
            disabled={submitting}
            onChange={(event) =>
              setVisited(
                event.target.checked
              )
            }
            className="h-4 w-4 accent-[#0F5132]"
          />

          I have visited this destination
        </label>

        {error && (
          <div
            className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
            style={{
              background: COLORS.redSoft,
              color: COLORS.red,
            }}
          >
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {successMessage && (
          <div
            className="mb-4 rounded-xl px-4 py-2.5 text-sm"
            style={{
              background: COLORS.tint,
              color: COLORS.forest,
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: COLORS.forest,
          }}
        >
          {submitting ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />
              Saving...
            </>
          ) : isUpdating ? (
            <>
              <Edit3 size={14} />
              Update review
            </>
          ) : (
            <>
              <Send size={14} />
              Post review
            </>
          )}
        </button>
      </form>

      {fetching ? (
        <div className="py-10 text-center">
          <Loader2
            size={24}
            className="mx-auto animate-spin"
            style={{
              color: COLORS.muted,
            }}
          />
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="rounded-2xl border py-12 text-center"
          style={{
            borderColor: COLORS.border,
            color: COLORS.muted,
          }}
        >
          <Star
            size={28}
            className="mx-auto mb-2 opacity-30"
          />

          <p className="text-sm">
            No reviews yet — be the first
            to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={deleteReview}
              deletingId={deletingId}
              reportingReviewId={
                reportingReviewId
              }
              reportReason={reportReason}
              reportLoading={reportLoading}
              onOpenReport={(reviewId) => {
                setReportingReviewId(
                  reviewId
                )
                setReportReason('')
                setSuccessMessage('')
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