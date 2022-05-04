import axiosInstance from './axiosInstance';

const MODEL = 'users';

const UserService = {
  getUsers: async (params) => {
    const { data } = await axiosInstance.get(`/${MODEL}`, { params });
    return data;
  },
  getUser: async (id) => {
    const { data } = await axiosInstance.get(`${MODEL}`)
  }
};

export default UserService;
