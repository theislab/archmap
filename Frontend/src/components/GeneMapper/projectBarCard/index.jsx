import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import {
  Box, IconButton, LinearProgress, Stack, CardActionArea, Snackbar, Collapse, Link, Divider, Grid, Alert, Button, CircularProgress,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import DownloadIcon from '@mui/icons-material/Download';
import { useHistory } from 'react-router-dom';
import { getSubmissionProgressPercentage } from 'shared/services/UploadLogic';
import {
  MULTIPART_UPLOAD_STATUS, MULTIPART_UPLOAD_STATUS as Status, statusIsError, statusIsUpload, PROJECT_STATUS,
} from 'shared/utils/common/constants';
import Clear from '@mui/icons-material/Clear';
import ReplayIcon from '@mui/icons-material/Replay';
import ProgressBar from 'components/ProgressBar';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  ExpandLess, ExpandMore, InfoOutlined, StarBorder,
} from '@mui/icons-material';
import { Modal, ModalTitle } from 'components/Modal';
import TeamService from 'shared/services/Team.service';
import ProjectService from 'shared/services/Project.service';
import CellxgeneService from 'shared/services/Cellxgene.service';
import CustomButton from 'components/CustomButton';
import { TabCard } from '../TabCard';
import { colors } from 'shared/theme/colors';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { GeneralCard } from 'components/Cards/GeneralCard';
import ProjectInfo from '../ProjectInfo';
import { initSubmissionProgress, useSubmissionProgress } from 'shared/context/submissionProgressContext';
import axiosInstance from 'shared/services/axiosInstance';
import InfoIcon from '@mui/icons-material/Info';

function ProcessingStatus() {
  return (
    <>
      <Box sx={{ pr: 2, flexGrow: 1 }}>
        <LinearProgress />
      </Box>
      <Typography variant="caption" noWrap sx={{ pr: 2 }}>Processing by scArches...</Typography>
    </>
  );
}

function CanceldOrFailedStatus() {
  return (
    <Typography variant="caption">
      Upload failed or canceled
    </Typography>
  );
}

/**
 * Displays information in a card about the given project
 * @param project Object containing project data
 * @param atlas Object containing atlas data
 * @param model Object containing model data
 * @param userTeams Array containg objects with data about each team the user is a member of
 * @param handleDelete Function that is executed when the delete button is clicked.
 * If the project is already deleted, this function is executed when the restore button is clicked
 * Expects no parameter
 * @param deleted True if the project is deleted
 * @param loggedIn True if the user is logged in when creating the project.
 * When the user is not logged in, then some of the functionality of the project card is disabled.
 */

export default function ProjectBarCard({
  project, atlas, model, userTeams, handleDelete, deleted, loggedIn = true,
}) {
  const history = useHistory();
  const [submissionProgresses, setSubmissionProgresses] = useSubmissionProgress();

  const submissionProgress = submissionProgresses[project._id];

  const cancelUpload = () => {
    setSubmissionProgresses((prev) => ({
      ...prev,
      [project._id]: {
        ...(prev[project._id] ?? initSubmissionProgress(project.uploadId)),
        status: MULTIPART_UPLOAD_STATUS.CANCELING,
      },
    }));
    localStorage.setItem(`cancelUpload_${project.uploadId}`, '1');
  };

  const addProjectToTeam = async (teamId) => {
    TeamService.addProject(teamId, project._id);
  };

  const color = project.status === PROJECT_STATUS.DOWNLOAD_READY
    ? 'lightGreen'
    : project.status === PROJECT_STATUS.ABORTED
      || (!submissionProgress && project.status === PROJECT_STATUS.UPLOAD_PENDING)
      || project.status === PROJECT_STATUS.PROCESSING_FAILED
      || submissionProgress?.status === MULTIPART_UPLOAD_STATUS.CANCELING
      || (submissionProgress && statusIsError(submissionProgress.status))
      ? 'red'
      : 'orange';

  // The team that the project has been added to.
  const [projectTeam, setProjectTeam] = useState([]);
  const [addTeam, setAddTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [open, setOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [Metric1InfoOpen, setMetric1InfoOpen] = useState(false);
  const [Metric2InfoOpen, setMetric2InfoOpen] = useState(false);
  const [Metric3InfoOpen, setMetric3InfoOpen] = useState(false);
  const [Metric4InfoOpen, setMetric4InfoOpen] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [fetchUrlError, setFetchUrlError] = useState(null);
  const [fetchingRatio, setFetchingRatio] = useState(false);
  const [fetchedRatio, setFetchedRatio] = useState('');
  const [fetchRatioError, setFetchRatioError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [fetchingMetrics, setFetchingMetrics] = useState(false);
  // const [fetchedMetrics, setFetchedMetrics] = useState('');
  // const [fetchRatioMetrics, setFetchMetricsError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const updatedProjectTeam = [];
      await Promise.all(
        userTeams.map(async (team) => {
          let projects = await ProjectService.getTeamProjects(team._id);
          projects = projects.filter((pr) => pr._id === project._id);
          // If the project belongs to the team, add the team to updatedProjectTeam.
          if (projects.length > 0) {
            updatedProjectTeam.push(team);
          }
        })
      );
      setProjectTeam(updatedProjectTeam);
    };
  
    fetchProjects();
  }, [userTeams, project._id]);

  useEffect(() => {
    const fetchRatio = async () => {
      
      setFetchingRatio(true);
      setFetchRatioError(null);

      try {
        setFetchedRatio(project.ratio)

      } catch (err) {
        console.error('Error fetching ratio:', err);
        setFetchRatioError('Failed to fetch ratio.');
      } finally {
        setFetchingRatio(false);
      }
    };
    fetchRatio(project._id);
  }, [project]);


  // useEffect(() => {
  //   const fetchMetrics = async () => {
      
  //     setFetchingMetrics(true);
  //     setFetchMetricsError(null);

  //     try {
  //       setFetchedMetrics(project.ratio)

  //     } catch (err) {
  //       console.error('Error fetching ratio:', err);
  //       setFetchMetricsError('Failed to fetch ratio.');
  //     } finally {
  //       setFetchingMetrics(false);
  //     }
  //   };
  //   fetchMetrics(project._id);
  // }, [project]);

  const handleOpen = () => setAddTeam(true);
  const handleClose = () => setAddTeam(false);

  const handleOpenInfo = () => setIsModalOpen(true);

  const handleClickCard = () => {
    setOpen(!open);
  };

  const fetchPresignedUrlAndDownload = async ([location,outputFileWithCounts]) => {
    setFetchingUrl(true);
    setFetchUrlError(null);

    
    let outputFile;

    if (!outputFileWithCounts) {
    // for demos
      outputFile = location.substr(56);
    } else {
      outputFile = outputFileWithCounts;
      
    }


    try {
      const response = await axiosInstance.post('/file_download/results', {
        // id: projectId,
        // status: status,
        outputFileWithCounts: outputFile,

      });

      

      const data = await response.data;
      const presignedUrl = data.presignedUrl;
      // Create a temporary anchor tag and programmatically click it to download the file
      const link = document.createElement('a');
      link.href = presignedUrl;
      link.download = `${project.name}.h5ad`; // Set the download filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error fetching presigned URL:', err);
      setFetchUrlError('Failed to download file.');
    } finally {
      setFetchingUrl(false);
    }
  };

  // Cellxgene-specific variables
  // Status types: launching, ready, or null 
  const [cellxgene, setCellxgene] = useState({ status: null });
  const [snackbar, setSnackbar] = useState({ open: false, type: "error" });

  const launchCellxgene = async (fileURL) => {
    // Create Cellxgene instance
    setSnackbar({ open: true, type: "success" });
    setCellxgene({ ...cellxgene, status: "launching" });
    let res = await CellxgeneService.postCellxgeneService(fileURL);
    // setURL of the result for visualization
    if(!res){
      setSnackbar({ open: true, type: "error", message: "Error occurred!" });
      setCellxgene({ ...cellxgene, status: null });
      return;
    }
    setCellxgene({ ...res, status: "ready" });
    setSnackbar({ open: true, type: "success", message: "Cellxgene instance launched. Timeout set to 1 hr." });
    // Update cache
    let cachedProjects = JSON.parse(localStorage.getItem("cached_projects"));
    cachedProjects[project._id]["cellxgene"] = res;
    localStorage.setItem("cached_projects", JSON.stringify(cachedProjects));
  }

  // Set cellxgene state based on the cache value
  useEffect(() => {
    const cachedProjects = JSON.parse(localStorage.getItem("cached_projects"));
    const cxgValue = cachedProjects[project._id]?.cellxgene;
    if(cxgValue && cxgValue.timeout > Date.now())  setCellxgene({ ...cxgValue, status: "ready" })
  }, [project]);

  return (
    <Box sx={{ mb: 2 }}>
      <GeneralCard padding={0}>
        <CardActionArea
          disableTouchRipple
          sx={{
            p: 2, borderRadius: 'inherit',
          }}
        >
          <Grid container direction="row" justifyContent="space-between" sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <Grid
              item
              xs={12}
              md={8}
              container
              direction="row"
              alignItems="center"
              onClick={handleClickCard}
            >
              <Grid container item xs={4} alignItems="center">
                <Box sx={{ flexDirection: 'row', alignItems: 'center' }}>
                  {open ? (
                    <ExpandLess sx={{
                      fontSize: 30,
                      transform: 'rotate(180deg)',
                    }}
                    />
                  ) : (
                    <ExpandMore sx={{
                      fontSize: 30,
                      transform: 'rotate(-90deg)',
                    }}
                    />
                  )}
                </Box>
                <CircleIcon sx={{
                  fontSize: 30, color, mr: 1,
                }}
                />
                <Typography noWrap>
                  {project.name}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                {submissionProgress ? (
                  <Box
                    sx={{
                      flexGrow: 1, display: 'flex', alignItems: 'center',
                    }}
                  >
                    {statusIsUpload(submissionProgress.status)
                      && (
                        <>
                          <Box sx={{ pr: 2, flexGrow: 1 }}>
                            <LinearProgress variant="determinate" value={getSubmissionProgressPercentage(submissionProgress)} />
                          </Box>
                          <Typography variant="caption">Uploading...</Typography>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelUpload();
                            }}
                          >
                            <Clear color="error" />
                          </IconButton>
                        </>
                      )}
                    {statusIsError(submissionProgress.status)
                      && <CanceldOrFailedStatus />}
                    {submissionProgress.status === MULTIPART_UPLOAD_STATUS.CANCELING
                      && <CanceldOrFailedStatus />}
                    {submissionProgress.status === MULTIPART_UPLOAD_STATUS.COMPLETE
                      && project.status !== PROJECT_STATUS.DOWNLOAD_READY
                      && project.status !== PROJECT_STATUS.ABORTED
                      && project.status !== PROJECT_STATUS.PROCESSING_FAILED
                      && <ProcessingStatus />}
                    {(project.status === PROJECT_STATUS.ABORTED
                      || project.status === PROJECT_STATUS.PROCESSING_FAILED)
                      && <>
                    <Typography variant="caption" color="error">
                      Processing failed
                    </Typography>
                    {project.errorMessage &&
                      <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                        ({project.errorMessage})
                      </Typography>
                    }
                  </>}
                  </Box>
                ) : null}
                {!submissionProgress
                  ? (
                    <Box
                      sx={{
                        flexGrow: 1, display: 'flex', alignItems: 'center',
                      }}
                    >
                      {project.status === PROJECT_STATUS.UPLOAD_PENDING
                        && <CanceldOrFailedStatus />}
                      {project.status === PROJECT_STATUS.PROCESSING_PENDING 
                        && <ProcessingStatus />}
                      {(project.status === PROJECT_STATUS.ABORTED
                        || project.status === PROJECT_STATUS.PROCESSING_FAILED)
                && <>
                    <Typography variant="caption" color="error">
                      Processing failed
                    </Typography>
                    {project.errorMessage &&
                      <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                        ({project.errorMessage})
                      </Typography>
                    }
                  </>}
                    </Box>
                  )
                  : null}
              </Grid>
            </Grid>
            <Grid container item md={4} justifyContent="flex-end">
              {/* Mapping info button */}
              <Box sx={{paddingLeft: '10px'}}>
                <IconButton
                    onClick={handleOpenInfo}
                  >
                    {<InfoIcon />}
                </IconButton>
                <Modal
                  isOpen={isModalOpen}
                  setOpen={setIsModalOpen}
                  sx={{ position: 'fixed', top: '20%' }}
                  >
                    <h1>Evaluation metrics</h1>
                      {<Typography> 
                          Below are the mapping quality metrics for the selected mapping. See the <a
                            style={{
                              textDecoration: "none",
                            }} href="https://archmap-docu.readthedocs.io/en/latest/visualization/index.html#mapping-evaluation"><Typography sx={{
                              color: colors.primary[400],
                              ':hover': { color: colors.primary[500] }
                            }} display="inline">docs </Typography></a>for more info on how to interpret these metrics.
                      </Typography>}
                      <br />

                        <Typography>
                          {`Cluster preservation score: ${project.clust_pres_score}`}
                          {<IconButton size="small" onClick={() => setMetric1InfoOpen(true)}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>}
                        </Typography>
                        <Modal
                          isOpen={Metric1InfoOpen}
                          setOpen={setMetric1InfoOpen}
                          sx={{ position: 'fixed', top: '20%' }}
                        >
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            ml: 3,
                            mr: 3,
                          }}
                          >
                            <Box sx={{
                              display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',
                            }}
                            >
                              <ModalTitle>
                                Cluster preservation score
                              </ModalTitle>
                            </Box>

                            <Box>
                              <Typography sx={{ width: '100%', maxWidth: '800px' }}>
                              This score assesses how well unsupervised clustering of the query dataset is preserved after the mapping process.
                              The mean entropy of cluster labels within each neighborhood is computed for both the original and integrated query.
                              The median of the differences in mean entropy between the original and integrated query is then calculated. 
                              Scores are scaled between 0 and 5 with 5 being the best.
                              </Typography>
                            </Box>
                          </Box>

                        </Modal>    
                        <Typography>
                          {`Percentage query cells with anchors: ${project.query_with_anchor}`}
                          { <IconButton size="small" onClick={() => setMetric2InfoOpen(true)}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>}
                        </Typography>
                        <Modal
                          isOpen={Metric2InfoOpen}
                          setOpen={setMetric2InfoOpen}
                          sx={{ position: 'fixed', top: '20%' }}
                        >
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            ml: 3,
                            mr: 3,
                          }}
                          >
                            <Box sx={{
                              display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',
                            }}
                            >
                              <ModalTitle>
                              Percentage query cells with anchors
                              </ModalTitle>
                            </Box>

                            <Box>
                              <Typography sx={{ width: '100%', maxWidth: '800px' }}>
                              This score quantifies the percentage of query cells that have at least one mutual nearest neighbor among the cells of the reference dataset. These mutual nearest neighbours are termed anchors.

                              </Typography>
                            </Box>
                          </Box>

                        </Modal>    
                        <Typography>
                          {`Percentage query cells unknown: ${project.percentage_unknown}`}
                          {<IconButton size="small" onClick={() => setMetric3InfoOpen(true)}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>}
                        </Typography>
                        <Modal
                          isOpen={Metric3InfoOpen}
                          setOpen={setMetric3InfoOpen}
                          sx={{ position: 'fixed', top: '20%' }}
                        >
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            ml: 3,
                            mr: 3,
                          }}
                          >
                            <Box sx={{
                              display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',
                            }}
                            >
                              <ModalTitle>
                              Percentage query cells unknown
                              </ModalTitle>
                            </Box>

                            <Box>
                              <Typography sx={{ width: '100%', maxWidth: '800px' }}>
                                This score quantifies the percentage of cells that are labelled as "Unknown" during cell type label transfer. It is based on the Mahalanobius uncertainty score for each query cell.
                                A query cell is classified as having an "Unknown" cell type if its Euclidean uncertainty score is above 0.5. 
                              </Typography>
                            </Box>
                          </Box>

                        </Modal>  
                        <Typography>
                          {`Percentage overlapping genes: ${project.ratio}`}
                          {<IconButton size="small" onClick={() => setMetric4InfoOpen(true)}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>}
                        </Typography>
                        <Modal
                          isOpen={Metric4InfoOpen}
                          setOpen={setMetric4InfoOpen}
                          sx={{ position: 'fixed', top: '20%' }}
                        >
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            ml: 3,
                            mr: 3,
                          }}
                          >
                            <Box sx={{
                              display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',
                            }}
                            >
                              <ModalTitle>
                                Percentage overlapping genes
                              </ModalTitle>
                            </Box>

                            <Box>
                              <Typography sx={{ width: '100%', maxWidth: '800px' }}>
                              During mapping, query genes are subsetted to match the genes of the atlas and for any missing genes, expression values are padded with zeros. A larger number of missing genes in the query data may lead to inaccuracy in results.
                              A value less than 85% may contribute to poor mapping quality.
                              </Typography>
                            </Box>
                          </Box>

                        </Modal>      
                        <h3>Visualizing downloaded results</h3>
                          {<Typography> 
                              ArchMap's built-in visualization functionality includes only a subset of the original reference to aid faster computation. Therefore, the neighbourhood graph of the downloaded file containing the full mapping must be recomputed if visualization is desired downstream. For more info on how to recompute the neighbourhood graph see the <a
                          style={{
                            textDecoration: "none",
                          }} href="https://archmap-docu.readthedocs.io/en/latest/faqs/index.html#how-can-i-visualize-my-downloaded-results-myself-in-cellxgene"><Typography sx={{
                            color: colors.primary[400],
                            ':hover': { color: colors.primary[500] }
                          }} display="inline">FAQs</Typography></a> in the docs.
                              </Typography>}
                      
                </Modal>
              </Box>
              <Box sx={{
                p: 0.1, bgcolor: 'background.paper', borderRadius: 3, width: 'flex', display: 'flex', alignItems: 'center',
              }}
              >
                {!deleted
                  && (
                    <>
                      {/* render team button if logged in */}
                      {
                        loggedIn && (projectTeam?.title // TODO: you might need to remove this. 
                          ? (
                            <CustomButton type="tertiary" sx={{ mr: 1 }} onClick={() => history.push(`/sequencer/teams/${projectTeam._id || projectTeam.id}`)}>
                              <Typography>
                                {projectTeam.title}
                              </Typography>
                            </CustomButton>
                          )
                          : (
                            <Button
                              variant="outlined"
                              sx={{
                                borderRadius: 100,
                                mr: 1,
                              }}
                              style={{ textTransform: 'none' }}
                              onClick={handleOpen}
                            >
                              <Typography>
                                Add To Team
                              </Typography>
                            </Button>
                          ))
                      }
                    
                      {/* Launch Button */}
                      {((!cellxgene.status) || (Date.now() > cellxgene.timeout && cellxgene?.status!=="launching"))
                        && (<CustomButton
                          type="primary"
                          onClick={() => launchCellxgene(project.location)}
                          // disable it if the project status is not DOWNLOAD_READY
                          disabled={project.status !== "DOWNLOAD_READY"}
                        >
                          <Typography>Launch</Typography>
                        </CustomButton>)
                      }
                      
                      {/* View Button */}
                      {cellxgene.status === "launching"
                        && (<CustomButton type="primary" disabled={cellxgene.status !== "ready"} style={{ display: 'flex', alignItems: 'center' }}>
                          <Typography>
                            Launching
                            <CircularProgress style={{width: '20px', height: '20px', marginLeft: '10px'}} />
                          </Typography>
                        </CustomButton>
                        )}
                      {cellxgene.status === "ready" && Date.now() <= cellxgene.timeout
                        && (<CustomButton
                          type="primary"
                          disabled={cellxgene.status !== "ready"}>
                          <Typography>
                            <Link
                              target="_blank"
                              style={{
                                textDecoration: "none",
                                color: "white",
                              }}
                              rel="noopener noreferrer"
                              href={cellxgene.url}>
                              View Results
                            </Link>
                          </Typography>
                        </CustomButton>)
                      }
                      {/* Snackbar after launching cellxgene */}
                      <Snackbar
                        open={snackbar.open}
                        autoHideDuration={10000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                      >
                        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.type} sx={{ width: '100%' }}>
                          {
                            // let setMessage = () => {
                            //   if (snackbar.type === "success") {
                            //     if (snackbar.message)
                            //       return 'snackbar.message';

                            //     return 'Launching a CellxGene instance. This may take a while...';
                            //   }
                            //   return 'Error occurred!';
                            // }
                            // setMessage();

                          }
                          {snackbar.message ? snackbar.message :
                            (snackbar.type === "success"
                              ? 'Launching a CellxGene instance. This may take a while...' : 'Error occurred!')
                          }
                        </Alert>
                      </Snackbar>
                      <Box sx={{paddingLeft: '10px'}}>
                        <IconButton
                            onClick={() => fetchPresignedUrlAndDownload([project.location,project.outputFileWithCounts])}
                            disabled={project.status !== 'DOWNLOAD_READY' || fetchingUrl}
                          >
                            {fetchingUrl ? <CircularProgress size={24} /> : <DownloadIcon />}
                        </IconButton>
                        {fetchUrlError && <Typography color="error">{fetchUrlError}</Typography>}
                        <IconButton onClick={() => handleDelete()}>
                        {deleted
                          ? <ReplayIcon />
                          : <DeleteOutlineIcon color="error" />}
                        </IconButton>
                      </Box>
                    </>
                  )}
              </Box>
            </Grid>
          </Grid>
        </CardActionArea>

        <Collapse in={open} timeout="auto">
          <Divider variant="middle" />
          <Box sx={{ pl: 11.5, pb: 1, pt: 1 }}>
            <ProjectInfo project={project} atlas={atlas} model={model}/>           
          </Box>
        </Collapse>

      </GeneralCard>
      <Modal
        isOpen={addTeam}
        setOpen={setAddTeam}
        sx={{ position: 'fixed', top: '20%' }}
      >
        <ModalTitle>
          <Stack direction="row" alignItems="center">
            Select a Team
            <IconButton size="small" onClick={() => setShowInfo(true)}>
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Stack>
        </ModalTitle>
        <Modal
          isOpen={showInfo}
          setOpen={setShowInfo}
          sx={{ position: 'fixed', top: '20%' }}
        >
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            ml: 3,
            mr: 3,
          }}
          >
            <Box sx={{
              display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',
            }}
            >
              <ModalTitle>
                Why Adding to a Team?
              </ModalTitle>
            </Box>

            <Box>
              <Typography sx={{ width: '100%', maxWidth: '800px' }}>
                By Adding to a team, the visibility of
                a project will be inherited
                from the visibility of the team.
                If the assigned team is public,
                all teams will have access to the project.
                If the assigned team is private, the project will be
                accessible only to this team.
              </Typography>
            </Box>
          </Box>

        </Modal>    
        {userTeams?.length === 0
          && (
            <Alert severity="info">
              You have no existing teams. Please add your teams in community.
            </Alert>
          )}
        <Box>
          {userTeams.map( 
            (team) => {
              const added = projectTeam.filter((t) => t._id === team._id).length > 0;
              return (<TabCard
                key={team._id}
                data={{name: team.name, title: team.title, type: "team", visibility: team.visibility.toLowerCase(), added: added}}
                selected={team?._id === selectedTeam || team?.id === selectedTeam}
                handleOnClick={() => setSelectedTeam(team?._id || team?.id)}
                isLoading={false}
              />)
            }
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 4 }}>
            <CustomButton
              type="tertiary"
              onClick={() => {
                setSelectedTeam('');
                setAddTeam(false);
              }}
            >
              Close

            </CustomButton>
            <CustomButton
              type="primary"
              onClick={async () => {
                addProjectToTeam(selectedTeam);
                setAddTeam(false);
                setSelectedTeam('');
                await TeamService.getTeam(selectedTeam).then((team) => setProjectTeam([...projectTeam, team]));
              }}
              disabled={selectedTeam === ''}
            >
              Confirm
            </CustomButton>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
