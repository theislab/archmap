import axiosInstance from "./axiosInstance";

const CLASSIFIER = "classifier";
const CLASSIFIERS = "classifiers";

const ClassifierService = {
  getClassifiers: async () => {
    const { data } = await axiosInstance.get(`/${CLASSIFIERS}`);
    return data;
  },

  getClassifierById: async (id) => {
    const { data } = await axiosInstance.get(`/${CLASSIFIER}/${id}`);
    return data;
  },
};

export default ClassifierService;
