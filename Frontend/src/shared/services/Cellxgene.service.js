import axiosInstance from './axiosInstance';

const CELLXGENE = 'cellxgene';
const URL_FOR_TESTING = "https://storage.googleapis.com/jst-2021-bucket-static/demos/result_pancreas_scanvi_cxg/result_pancreas_scANVI_cxg.h5ad";

const CellxgeneService = {
    postCellxgeneService: async (fileURL) => {
        try{
            // TODO: replace the URL for testing with fileURL
            const { data }  = await axiosInstance.post(`/${CELLXGENE}`, { location: URL_FOR_TESTING });
            return data;
        }catch(err){
            console.log(err);
        }
    }
}

export default CellxgeneService;