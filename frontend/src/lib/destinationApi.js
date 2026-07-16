import apiClient from './apiClient'

export const destinationApi = {
  async getAll(params = {}) {
    const response = await apiClient.get(
      '/destinations',
      { params }
    )

    return response.data
  },

  async getById(destinationId) {
    const response = await apiClient.get(
      `/destinations/${destinationId}`
    )

    return response.data
  },
}