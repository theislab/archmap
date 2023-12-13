import axiosInstance from './axiosInstance';

const PATH = "model_setup_anndata_args";

const AnndataArgsService = {
  postAnndataArgs: async (scviHubId) => {
    const postData = {
      scviHubId: scviHubId
    }

    const { data } = await axiosInstance.post(`/${PATH}`, postData);
    return data;
  }
}

export default AnndataArgsService;
