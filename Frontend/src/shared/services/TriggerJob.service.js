import axiosInstance from './axiosInstance';

const PATH = "trigger-job";

const TriggerJobService = {
  TriggerJob: async (modelPath, atlasPath, modelName, batchKey, cellTypeKey, atlasName, atlasId) => {
    const postData = {
      modelPath: modelPath,
      atlasPath: atlasPath,
      modelName: modelName,
      batchKey: batchKey,
      cellTypeKey: cellTypeKey,
      atlasName: atlasName,
      atlasId: atlasId
    }

    console.log(postData)

    const { data } = await axiosInstance.post(`/${PATH}`, postData);
    return data;
  }
}

export default TriggerJobService;
