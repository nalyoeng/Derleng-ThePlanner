import apiClient from './apiClient'

export const destinationApi = {
  async getAll(params = {}) {
    // Add '/api' before '/destinations'
    const response = await apiClient.get(
      '/api/destinations', 
      { params }
    )

    return response.data
  },

  async getById(destinationId) {
    // Add '/api' before '/destinations'
    const response = await apiClient.get(
      `/api/destinations/${destinationId}`
    )

    return response.data
  },
}