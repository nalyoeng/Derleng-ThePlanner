import apiClient from './apiClient'

export const reviewApi = {
  async getForDestination(destinationId, params = {}) {
    const response = await apiClient.get(
      `/reviews/destination/${destinationId}`,
      { params },
    )

    return response.data
  },

  async getById(reviewId) {
    const response = await apiClient.get(
      `/reviews/${reviewId}`,
    )

    return response.data
  },

  async create(destinationId, reviewData) {
    const response = await apiClient.post(
      `/reviews/destination/${destinationId}`,
      reviewData,
    )

    return response.data
  },

  async update(reviewId, reviewData) {
    const response = await apiClient.patch(
      `/reviews/${reviewId}`,
      reviewData,
    )

    return response.data
  },

  async remove(reviewId) {
    const response = await apiClient.delete(
      `/reviews/${reviewId}`,
    )

    return response.data
  },
  async report(reviewId, reason) {
  const response = await apiClient.post(
    `/reviews/${reviewId}/report`,
    { reason }
  )

  return response.data
},
}