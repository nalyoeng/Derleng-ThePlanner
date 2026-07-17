import apiClient from './apiClient';

export const favoriteApi = {
  async getMine() {
    const response =
      await apiClient.get('/favorites');

    return response.data;
  },

  async add(destinationId) {
    const response =
      await apiClient.post(
        `/favorites/${destinationId}`
      );

    return response.data;
  },

  async remove(destinationId) {
    const response =
      await apiClient.delete(
        `/favorites/${destinationId}`
      );

    return response.data;
  },
};