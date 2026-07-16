import apiClient from './apiClient'

export const profileApi = {
  async getMe() {
    const response = await apiClient.get('/profile/me')
    return response.data
  },

  async updateMe(profileData) {
    const response = await apiClient.patch(
      '/profile/me',
      profileData
    )

    return response.data
  },
}