import axiosInstance from './axiosInstance';

const PATH = "trigger-job";

const TriggerJobService = {
  TriggerJob: async (modelID) => {
    const postData = {
        modelID: modelID
    }

    const { data } = await axiosInstance.post(`/${PATH}`, postData);
    return data;
  }
}

export default TriggerJobService;
