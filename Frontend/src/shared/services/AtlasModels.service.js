import axiosInstance from './axiosInstance';

const ASSOCIATIONS = 'get-all-associations';

const AtlasModelsAssociationsService = {
  getAtlasesModels: async () => {
    const { data } = await axiosInstance.get(`/${ASSOCIATIONS}`);
    return data;
  },
};

export default AtlasModelsAssociationsService;
