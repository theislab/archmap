import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import {
  Typography, createTheme, ThemeProvider, Stack, TextField, Alert, CircularProgress,
} from '@mui/material';
import PlusIcon from 'components/general/PlusIcon';
import Search from 'components/Search';
import ProjectBarCard from 'components/GeneMapper/projectBarCard';
import SearchIcon from '@mui/icons-material/Search';
import { colors } from 'shared/theme/colors';
import ProjectService from 'shared/services/Project.service';

import {
  MULTIPART_UPLOAD_STATUS, PROJECTS_UPDATE_INTERVAL, PROJECT_STATUS, statusIsError,
} from 'shared/utils/common/constants';
import ProjectMock from 'shared/services/mock/projects';
import AtlasService from 'shared/services/Atlas.service';
import ModelService from 'shared/services/Model.service';
import DemoService from 'shared/services/Demo.service';
import TeamService from 'shared/services/Team.service';
import { useHistory } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#5676E4',
    },
  },
});

// The loggedIn parameter is set to true when the user is logged in
function GeneMapperHome({ style, loggedIn }) {
  const [projects, setProjects] = useState(null);
  const [deletedProjects, setDeletedProjects] = useState([]);
  const [atlases, setAtlases] = useState([]);
  const [models, setModels] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [demoDatasets, setDemoDatasets] = useState([]);

  const [findString, setFindString] = useState('');

  const history = useHistory();

  /**
   * Function to find matching demos in the data variable.
   * If demos are found, the information stored about them in the "data" variable is updated.
   * @param data: The data variable containing the projects to search for demos in.
   * @param demos: The array of available demos
   */
  const findDemos = (data, demos) => {
    // loop over projects and search for demo datasets and set their attributes
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < demos.length; j++) {
        // If the project is a demo, the id is stored in the file name.
        // file_name: <atlas>_<model>_<demo_id>
        const id = data[i].fileName.split('_')[2];
        // update the stored information about the demo datasets
        if (id && id === demos[j]._id) {
          // updating the demo dataset
          data[i] = {
            ...data[i],
            status: PROJECT_STATUS.DOWNLOAD_READY,
            location: demos[j].h5adURL,
            query_with_anchor: demos[j].query_with_anchor,
            clust_pres_score: demos[j].clust_pres_score,
            percentage_unknown: demos[j].percentage_unknown,
            ratio: demos[j].ratio,
            result: demos[j].result,
            outputFileWithCounts: demos[j].outputFileWithCounts,
          };
        }
      }
    }
  };

  // function to handle deletion of project
  const handleDeleteProject = (id) => {
    DemoService.getDemos().then((demos) => {
      // delete project from cache permanently
      let cachedProjects = JSON.parse(localStorage.getItem("cached_projects"));
      delete cachedProjects[id];
      localStorage.setItem("cached_projects", JSON.stringify(cachedProjects));

      const updatedProjects = projects.filter((project) => project._id !== id);

      // Set deleted projects
      setProjects(updatedProjects)

      // update the projects that are not deleted
      ProjectService.deleteProject(id).then(() => {
        ProjectService.getOwnProjects().then((data) => {
          // search for demos and set the information stored about them
          findDemos(data, demos);
          setProjects(data);
        });
        // update the projects that are deleted
        ProjectService.getDeletedProjects().then((data) => {
          // search for demos and set the information stored about them
          findDemos(data, demos);
          console.log(data);
          setDeletedProjects(data);
        });
      });
    });
  };

  // function to handle restoration of project
  const handleRestoreProject = (id) => {
    DemoService.getDemos().then((demos) => {
      ProjectService.restoreProject(id).then(() => {
        ProjectService.getOwnProjects().then((data) => {
          // search for demos and set the information stored about them
          findDemos(data, demos);
          // update the information about the demos
          setProjects(data);
        });
        ProjectService.getDeletedProjects().then((data) => {
          // search for demos and set the information stored about them
          findDemos(data, demos);
          setDeletedProjects(data);
        });
      });
    });
  };

  const getProjects = () => {
    // fetch demos
    DemoService.getDemos().then((demos) => {
      ProjectService.getOwnProjects().then((data) => {
        // search for demos and set the information stored about them
        findDemos(data, demos);
        setDemoDatasets(demos);
        setProjects(data);

        // check if indexedDB is available for caching the projects
        if (!window.indexedDB) {
          setProjects(data);
          return;
        }
        // Save an object that consists of the projects in the local storage.
        if (localStorage.getItem("cached_projects") === null) {
          localStorage.setItem("cached_projects", JSON.stringify({}));
        }
        let cachedProjects = JSON.parse(localStorage.getItem("cached_projects"));

        // filter out duplicate projects
        data.forEach((obj) => {
          let id = obj._id;
          let status = obj.status;
          // If the cached projects object doesn't have a project with a matching id,
          // add it to the cache. 
          if (!cachedProjects.hasOwnProperty(id) || cachedProjects[id].status !== status) {
            cachedProjects[id] = obj;
          }
        });
        // turn cached project object to array and reverse the order
        let projectArr = Object.keys(cachedProjects).map((key) => cachedProjects[key]).reverse();
        setProjects(projectArr);
        // update the local storage
        localStorage.setItem("cached_projects", JSON.stringify(cachedProjects));
      });
    });
  };

  useEffect(() => {
    getProjects();
    const timer = setInterval(() => getProjects(), PROJECTS_UPDATE_INTERVAL);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    AtlasService.getAtlases().then((data) => setAtlases(data));
    ModelService.getModels().then((data) => setModels(data));
    if (loggedIn) {
      TeamService.getMyTeams().then((teams) => setUserTeams(teams));
      DemoService.getDemos().then((demos) => {
        ProjectService.getDeletedProjects().then((data) => {
          findDemos(data, demos);
          setDeletedProjects(data);
        });
      });
    }
  }, []);

  return (
    <div style={style}>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            pt: 2,
            pb: 3,
          }}
        >
          <Stack direction="row" className="stack" alignItems="Center">
            <Typography variant="h5" sx={{ pr: 1 }}>Your Mappings</Typography>
            <PlusIcon onClick={() => { history.push('genemapper/create'); }} />
          </Stack>
          {/* Search bar */}
          <Box sx={{ alignSelf: 'center', width: { xs: '95%', md: '25%' }, marginBlock: '2%' }}>
            <Search
              value={findString}
              handleSearch={(str) => setFindString(str)}
              noFilterComponent={true}
            />
          </Box>
        </Box>
        {/* Check if project cache exists to make sure that checking the projects is even necessary */}
        {localStorage.getItem('cached_projects') && projects === null
          && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          )}
        {/* If there is no project cached, no projects exist either. */}
        {(!localStorage.getItem('cached_projects') || projects?.length === 0)
          && (
            <Alert severity="info">
              You have not created any mappings yet. There are
              Create one by clicking the Plus Icon.
            </Alert>
          )}
        {projects
          && (
            <div>
              {projects.filter((project) => ( // TODO: to add the search, use the findString like here
                (findString === '' || project.name.toLowerCase().includes(findString.toLowerCase())))).map((project) => {
                  let atlas = atlases.find((atlas) => String(atlas._id) === String(project.atlasId));
                  if(!atlas) atlas = { name: project.atlasId }; // set values for scvi hub atlas
                  let model = models.find((model) => String(model._id) === String(project.modelId));
                  if(!model){ // set values for the model if it is from scvi hub
                    let name;
                    if(project?.modelId) name = project?.modelId.slice(0,2) + project?.modelId?.slice(2).toUpperCase();
                    model = { name: name };
                  }
                  return (<ProjectBarCard
                    key={project._id}
                    project={project}
                    atlas={atlas}
                    model={model}
                    userTeams={userTeams}
                    handleDelete={() => handleDeleteProject(project._id)}
                    loggedIn={loggedIn}
                  />);
                })}
            </div>
          )}
        {loggedIn && deletedProjects.length > 0
          && (
            <Box>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Deleted Projects</Typography>
              {deletedProjects.map((project) => (
                <ProjectBarCard
                  key={project._id}
                  project={project}
                  atlas={atlases.find((atlas) => String(atlas._id) === String(project.atlasId))}
                  model={models.find((model) => String(model._id) === String(project.modelId))}
                  userTeams={userTeams}
                  loggedIn={loggedIn}
                  handleDelete={() => handleRestoreProject(project._id)}
                  deleted
                />
              ))}
            </Box>
          )}
      </ThemeProvider>
    </div>
  );
}

export default GeneMapperHome;
