const { default: axiosInstance } = require("./axiosInstance");





const AtlasUploadService = {
    createAtlas: async (name, batchKey, cellTypeKey, previewPictureURL, classifierLabels, modalities, numberOfCells, species, compatibleModels, selectedClassifier, atlasUrl, userId, isPrivate ) => {
      // Prepare JSON object for request

      // Trim leading and trailing whitespace from each string in classifierLabels
      const trimmedClassifierLabels = classifierLabels.map(label => label.trim());

      const atlasData = {
        name: name,
        batchKey: batchKey,
        cellTypeKey: cellTypeKey,
        previewPictureURL: previewPictureURL,
        classifierLabels: trimmedClassifierLabels,
        modalities: modalities, // Assuming modalities is an array
        numberOfCells: Number(numberOfCells),
        species: species,
        uploadedBy: String(userId),
        atlasUrl: atlasUrl,
        inrevision: true,
        isPrivate: isPrivate,
        benchmarked: false,
        compatibleModels: compatibleModels // Assuming compatibleModels is an array of model names
        
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