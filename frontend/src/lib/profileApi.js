import apiClient from './apiClient'

export const profileApi = {
  async getMe() {
    const response = await apiClient.get('api/profile/me')
    return response.data
  },

  async updateMe(profileData) {
    const response = await apiClient.patch(
      '/api/profile/me',
      profileData
    )

    return response.data
  },
}