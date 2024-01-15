const { default: axiosInstance } = require("./axiosInstance");





const AtlasUploadService = {
    createAtlas: async (name, previewPictureURL, modalities, numberOfCells, species, compatibleModels, selectedClassifier, atlasUrl, userId ) => {
      // Prepare JSON object for request
      
      const atlasData = {
        name: name,
        previewPictureURL: previewPictureURL,
        modalities: modalities, // Assuming modalities is an array
        numberOfCells: Number(numberOfCells),
        species: species,
        compatibleModels: compatibleModels, // Assuming compatibleModels is an array of model names
        selectedClassifier: selectedClassifier,
        atlasUrl: atlasUrl,
        uploadedBy: String(userId)
        
      };
      console.log("atlas data to be sent to backend", atlasData)
  
      // Send POST request to start upload for atlas
      const response = await axiosInstance.post('/file_upload/start_upload_for_atlas', atlasData);
      console.log("response from backend", response.data)
      const { atlas, models } = response.data;
      console.log("atlas and models", atlas, models)
      return { atlas, models };
    }
  };
  
  export default AtlasUploadService;