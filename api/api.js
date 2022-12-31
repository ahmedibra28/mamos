import axios from 'axios'

const baseUrl = 'http://localhost:3000/api'

export const userInfo = () => {
  return {
    userInfo:
      typeof window !== 'undefined' && localStorage.getItem('userInfo')
        ? JSON.parse(
            typeof window !== 'undefined' && localStorage.getItem('userInfo')
          )
        : null,
  }
}

export const config = () => {
  return {
    headers: {
      Authorization: `Bearer ${userInfo()?.userInfo?.token}`,
    },
  }
}

const axiosApi = async (method, url, obj = {}) => {
  try {
    switch (method) {
      case 'GET':
        return await axios
          .get(`${baseUrl}/${url}`, config())
          .then((res) => res.data)

      case 'POST':
        return await axios
          .post(`${baseUrl}/${url}`, obj, config())
          .then((res) => res.data)

      case 'PUT':
        return await axios
          .put(`${baseUrl}/${url}`, obj, config())
          .then((res) => res.data)

      case 'DELETE':
        return await axios
          .delete(`${baseUrl}/${url}`, config())
          .then((res) => res.data)
    }
  } catch (error) {
    throw error?.response?.data?.error
  }
}

export default axiosApi
