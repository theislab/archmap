import axiosInstance from './axiosInstance';

const CELLXGENE = 'cellxgene';

const CellxgeneService = {
    postCellxgeneService: async (fileURL) => {
        try{
            const { data }  = await axiosInstance.post(`/${CELLXGENE}`, { location: fileURL});
            return data;
        }catch(err){
            console.log(err);
        }
    }
}

export default CellxgeneService;