import React, { useEffect, useState } from 'react';
import { Modal, ModalTitle } from 'components/Modal';
import Button from 'components/CustomButton';
import {
  CircularProgress, Snackbar, Alert,
  DialogActions, DialogContent, DialogContentText,
} from '@mui/material';
import ProjectService from 'shared/services/Project.service';
import DemoService from 'shared/services/Demo.service';
import ProjectBarCard from 'components/GeneMapper/projectBarCard';
import AtlasService from 'shared/services/Atlas.service';
import ModelService from 'shared/services/Model.service';
import TeamService from 'shared/services/Team.service';
import { PROJECT_STATUS } from 'shared/utils/common/constants';

/**
 * TeamProjectList Component:
 * This component renders a list of projects associated with a specific team. It manages the display
 * of projects, allows administrators to remove projects, handles modal dialogs for project removal,
 * and fetches necessary data from various services.
 *
 * @param {Object} team - The team object for which projects are being listed.
 * @param {Object} institution - The institution associated with the team.
 * @param {Object} user - The current user object.
 * @param {boolean} isAdmin - Flag indicating if the current user is an admin.
 * @param {Function} updateTeam - Function to update team information after project removal.
 * @returns {JSX.Element} - A JSX element displaying the list of projects for the team.
 */
function TeamProjectList({
  team, institution, user, isAdmin, updateTeam,
}) {
  const [projects, setProjects] = useState([]);
  const [atlases, setAtlases] = useState([]);
  const [models, setModels] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [deletedProjects, setDeletedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [removedProject, setRemovedProject] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const [demos, setDemos] = useState([]);

  const handleCloseDialog = () => setDialogOpen(false);

  function handleDelete(project) {
    if (isAdmin) {
      setDialogOpen(true);
      setRemovedProject(project);
    } else {
      setSnackbarOpen(true);
    }
  }

  async function remove() {
    setErrorMessage('');
    try {
      await TeamService.removeProjectFromTeam(team._id, removedProject._id);
      handleCloseDialog();
      updateTeam();
    } catch (e) {
      setErrorMessage(e.message);
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  /**
  * Function to find matching demos in the data variable.
  * If demos are found, the information stored about them in the "data" variable is updated.
  * @param data - The data variable containing the projects to search for demos in.
  * @param demos - The array of available demos. 
  */
  const findDemos = (data, demos) => {
    // loop over projects and search for demo datasets and set their attributes
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < demos.length; j++) {
        // If the project is a demo, the demo id is stored in the file name.
        // file_name: <atlas>_<model>_<demo_id>
        const id = data[i].fileName.split('_')[2];
        // update the stored information about the demo datasets
        if (id && id === demos[j]._id) {
          // updating the demo dataset
          data[i] = {
            ...data[i],
            status: PROJECT_STATUS.DONE,
            location: demos[j].h5adURL,
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

  useEffect(() => {
    setIsLoading(true);
    AtlasService.getAtlases().then((data) => setAtlases(data));
    ModelService.getModels().then((data) => setModels(data));
    TeamService.getMyTeams().then((teams) => setUserTeams(teams));
    DemoService.getDemos().then((demos) => {
      setDemos(demos);
      // fetch the projects and update the information about the demos
      ProjectService.getTeamProjects(team._id).then((data) => {
        findDemos(data, demos);
        setProjects(data);
      });
    });
    setIsLoading(false);
  }, [team]);

  if (!team.memberIds?.includes(user._id) && ((team.visibility === 'PRIVATE')
    || (team.visibility === 'BY_INSTITUTION' && !institution.memberIds?.includes(user._id)))) {
    return (
      <Alert severity="warning">
        {`The projects of this team are hidden as its visibility is set to ${team.visibility.toLowerCase().replace('_', ' ')} and you're not a member of this team${team.visibility === 'BY_INSTITUTION' ? " or this team's institution" : ''}.`}
      </Alert>
    );
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  if (projects.length === 0) {
    return (
      <Alert severity="info">
        This team does not have any projects yet. Members can add one of their projects from the Gene Mapper page.
      </Alert>
    );
  }

  return (
    <div>
      <div>
        {projects.map((project) => {
          let atlas = atlases.find((atlas) => String(atlas._id) === String(project.atlasId));
          if (!atlas) {
            atlas = { name: project.atlasId }; // set values for scvi hub atlas
          }

          let model = models.find((model) => String(model._id) === String(project.modelId));
          if (!model) {
            // set values for the model if it is from scvi hub
            let name;
            if (project?.modelId) {
              name = project?.modelId.slice(0, 2) + project?.modelId?.slice(2).toUpperCase();
            }
            model = { name: name };
          }
          return (
            <ProjectBarCard
              key={project._id}
              project={project}
              atlas={atlas}
              model={model}
              userTeams={userTeams}
              handleDelete={() => handleDeleteProject(project._id)}
              loggedIn
            />
          );
        })}
      </div>
      <Modal
        isOpen={dialogOpen}
        setOpen={(o) => !o && handleCloseDialog()}
      >
        <ModalTitle>
          Remove Project
        </ModalTitle>
        <DialogContent>
          <DialogContentText>
            {`Do you really want to remove the project ${removedProject.name} from the team ${team.name}?`}
          </DialogContentText>
          {
            errorMessage && (
              <DialogContentText id="alert-dialog-description" color="error">
                {errorMessage}
              </DialogContentText>
            )
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} type="tertiary">Cancel</Button>
          <Button onClick={() => remove()} type="critical" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          Only an admin may remove projects from a team!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TeamProjectList;
