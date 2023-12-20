import axiosInstance from "./axiosInstance";
import MockProjectService from "./mock/Project.service";

const MODEL = "projects";
const MOCK_PROJECTS = false;

const ProjectService = MOCK_PROJECTS
  ? MockProjectService
  : {
      getProjects: async (params) => {
        const { data } = await axiosInstance.get(`/${MODEL}`, { params });
        return data;
      },

      getOwnProjects: async () => {
        const { data } = await axiosInstance.get("/ownprojects");
        return data;
      },

      getProject: async (id) => {
        const { data } = await axiosInstance.get(`/project/${id}`);
        return data;
      },

  createProject: async ({projectName, atlasId, modelId, fileName, classifierId, scviHubId = null, model_setup_anndata_args = null}) => { 
    // POST request for scvi hub atlas.
    if(scviHubId && model_setup_anndata_args){
      const { data } = await axiosInstance.post('/file_upload/start_upload', {
        projectName, atlasId, modelId, fileName, classifierId, scviHubId, model_setup_anndata_args
      });
      return data;
    }
    // Create a POST request with an Archmap Core atlas.
    const { data } = await axiosInstance.post('/file_upload/start_upload', {
      projectName, atlasId, modelId, fileName, classifierId
    });

    return data;
  },

      deleteProject: async (id) => {
        await axiosInstance.delete(`/project/${id}`);
      },

      getDeletedProjects: async () => {
        const { data } = await axiosInstance.get("/deletedprojects");
        return data;
      },

      restoreProject: async (id) => {
        await axiosInstance.post(`/deletedprojects/${id}/restore`);
      },

      getTeamProjects: async (teamId) => {
        const { data } = await axiosInstance.get(`/teams/${teamId}/projects`);
        return data;
      },
    };

export default ProjectService;
