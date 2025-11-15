import axiosInstance from './axiosInstance';

const ATLASES = 'atlases';
const ATLAS = 'atlas';

const AtlasService = {
  getAtlases: async () => {
    const { res } = await axiosInstance.get(`/${ATLASES}`);

    const data = res.data;                // this is { token, atlases }
    const token = data.token || null;     // extract the JWT
    const atlases = data.atlases || [];   // extract the atlas array

    if (token) {
      localStorage.setItem("public_jwt", token); // store the JWT for future requests
    }
    return atlases;
  },
  getAtlasById: async (id) => {
    const token = localStorage.getItem("public_jwt"); // retrieve JWT
    const { data } = await axiosInstance.get(`/${ATLAS}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    return data;
  },
};

export default AtlasService;
