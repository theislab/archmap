import axiosInstance from './axiosInstance';

// Endpoint name
const SCVI_ATLASES = 'scvi-atlases';

const ScviAtlasService = {
  getAtlases: async () => {
    const { data } = await axiosInstance.get(`/${SCVI_ATLASES}`);
    return data;
  },
};

export default ScviAtlasService;
