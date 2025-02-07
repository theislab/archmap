/* eslint-disable react/react-in-jsx-scope */
import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Modal, Switch, FormControlLabel  } from '@mui/material';
import { OutlinedButton } from './ModelCard';
import { colors } from 'shared/theme/colors';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import ModelService from 'shared/services/Model.service';
import AtlasModelsAssociationsService from 'shared/services/AtlasModels.service';
import TriggerJobService from 'shared/services/TriggerJob.service';
import axiosInstance from 'shared/services/axiosInstance';

/**
 * Atlas Card
 * @param width default value is 100% of parent
 * @param height default value is 100% of parent
 * @param title title of AtlasCard
 * @param imgLink thumbnail photo url
 * @param modalities
 * @param cellsInReference
 * @param species
 * @param mapLink onHover button Map url
 * @param learnMoreLink onHover button Learn More url
 * 
 */
export default function AtlasCard({
  width = '100%', height = '100%', title, atlas, atlasId, inrevision, uploadedBy, userId, isPrivate, imgLink, modalities,
  cellsInReference, species, learnMoreLink, onSelect, selected = false, disabled = false,
  isSearchPage = false
}) {
  // check if the mouse is hovering above the card
  const [isHover, setHover] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [fetchUrlError, setFetchUrlError] = useState(null);

  useEffect(() => {
    // Fetch models only once when the component mounts
    ModelService.getModels().then((data) => {
      setModels(data);
    });

    AtlasModelsAssociationsService.getAtlasesModels().then((data) => {
      setAssociations(data);
    });
  }, []); // Empty dependency array ensures this runs only once


  // const handlePrivacyToggle = () => {
  //   // Logic to save the updated privacy status can be added here (e.g., API call)
  //   setPrivacyModalOpen(false);
  //   console.log(`Atlas privacy updated to: ${newPrivacyStatus ? 'Private' : 'Public'}`);
  // };

  // check if the card is flat(width > height)
  {/*const [isFlat, setFlat] = useState(false);*/}

  const downloadBenchmarkClick = async (atlas) => {
    setFetchingUrl(true);
    setFetchUrlError(null);

    const outputFile = atlas.benchmark_location

    try {

      const response = await axiosInstance.post('/file_download/benchmark_results', {
        benchmarkResultsFile: outputFile,

      }); 

      const data = await response.data;
      const presignedUrl = data.presignedUrl;
      // Create a temporary anchor tag and programmatically click it to download the file
      const link = document.createElement('a');
      link.href = presignedUrl;
      link.download = `${atlas.name}_benchmark.tar.gz`; // Set the download filename
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

  const handleBenchmarkClick = () => {

    let association = null; // Declare association in the outer scope
    let found = false; // Flag to track if the association is found

    for (let j = 0; j < atlas.compatibleModels.length; j++) {
      for (let i = 0; i < associations.length; i++) {
        if (associations[i].atlas && atlas._id === associations[i].atlas._id) {
          association = associations[i]; // Assign the value
          console.log(association);
          found = true; // Set the flag
          break; // Exit the inner loop
        }
      }
      if (found) break; // Exit the outer loop
    }

    if (association) {
      console.log(association.modelUploadPath); // Safely access the property
    } else {
      console.log('No matching association found.');
    }

    console.log(association.modelUploadPath)
    console.log(atlas.atlasUploadPath)
    console.log(atlas.compatibleModels[0])
    console.log(atlas.batchKey)
    console.log(atlas.cellTypeKey)
    console.log(atlas.name)

    handleTriggerJob(
      association.modelUploadPath,
      atlas.atlasUploadPath,
      atlas.compatibleModels[0],
      atlas.batchKey,
      atlas.cellTypeKey,
      atlas.name, 
      atlas._id
    );
  };

  const handleTriggerJob = async (modelPath, atlasPath, modelName, batchKey, cellTypeKey, atlasName, atlasId) => {
    try {

      // req.body.modelpath = modelPath;
      // req.body.atlaspath = atlasPath;
      // req.body.modelname = modelName;
      // req.body.batchkey = batchKey;
      // req.body.celltypekey = cellTypeKey;
      // req.body.atlasname = atlasName

      
  
      const response = await TriggerJobService.TriggerJob(modelPath, atlasPath, modelName, batchKey, cellTypeKey, atlasName, atlasId);
      console.log("Job triggered successfully:", response.data);
  
      // Show a success message to the user
      alert("Job triggered successfully!");
    } catch (error) {
      console.error("Error triggering job:", error.message);
      alert("Failed to trigger the job. Please try again.");
    }
  };
  
  // ref to get the out most Box
  const boxRef = useRef();
  const history = useHistory();
  const path = history.location.pathname;
  {/*useEffect(() => {
    // each time the card is rerendered, check if the card is flat or not
    if (boxRef.current.clientWidth > boxRef.current.clientHeight) setFlat(true);
  });*/}

  const showModalities = () => {
    // TODO fix this
    if (modalities[0].length < 10) return modalities;
    return `${modalities[0].split(',')[0]}`;
  };

  const AtlasInfo = (title, data) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: data.length > 10 ? 'column' : 'row',
        gap: '5%',
      }}
    >
      <Typography
        sx={{
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
      >
        {title}
      </Typography>
      <Typography>{data}</Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        width, height,
      }}
    >
      <Box
        ref={boxRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        {
          !disabled && isHover
          && (
            <Box
              style={{
                background: 'linear-gradient(#4F83CC, #01579B)',
              }}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.95,
                boxShadow: '0px 4px 6px 0px rgba(1, 87, 155, .20), 0px 0px 1px 0px rgba(1, 87, 155, .32)',
              }}
            >
              <Box
                sx={{
                  margin: 'auto',
                  width: '70%',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  gap: '5px',
                }}
              >
                {
                  !isSearchPage && !inrevision && (
                  <OutlinedButton
                    content={selected ? "Deselect" : "Select"}
                    onClick={onSelect}
                  />
                  )
                }
                <OutlinedButton
                  content="Learn More"
                  link={learnMoreLink}
                  onClick={() => {
                    localStorage.setItem('atlasId', atlasId);
                  }}
                />
                {uploadedBy && uploadedBy === userId && (
                  <OutlinedButton
                   content="Atlas Benchmark"
                   onClick={() => setPrivacyModalOpen(true)}                
                  />
                )}
                {
                disabled
                && (
                <Typography sx={{
                  color: colors.primary[900], fontSize: '12px', textDecoration: 'underline', textAlign: 'center',
                }}
                >
                  Atlas unavailable for mapping with selected model
                </Typography>
                )
              }
              </Box>
            </Box>
          )
        }

        {/* DISABLED OVERLAY BOX */}
        {
          disabled &&
          <Box
            style={{ background: "linear-gradient(#e7e7e7, #d0d0d0)" }}
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: "1.2rem",
              cursor: "pointer",
              opacity: 0.95,
            }}>
            { 
              !isHover && 
              <Typography sx={{ position: "absolute", fontSize: "12px", fontWeight: "bold", color: colors.neutral[900], textAlign: "center", left: "28%" }}>
                Not Compatible
              </Typography>
            }
            <Box
              sx={{
                margin: 'auto',
                width: '70%',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                gap: '5px',
              }}
            >

              { isHover && <OutlinedButton content="Learn More" link={learnMoreLink} bg={colors.neutral[800]} color={colors.neutral[800]} onClick={(e) => e.stopPropagation()} bgHover={colors.neutral[100]} colorHover={colors.neutral[600]}/> }
              {/* <CustomButton type="outlined" href={learnMoreLink ? `#${learnMoreLink}` : null} onClick={(e) => e.stopPropagation()}>Learn More</CustomButton> */}
            </Box>
          </Box>
        }
        { !disabled
          && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isHover ? 'none' : '0px 4px 6px 0px rgba(33, 37, 41, .2), 0px 0px 1px 0px rgba(33, 37, 41, .32)',
              borderRadius: '1.2rem',
              justifyContent: 'center',
              borderStyle: 'solid',
              borderColor: selected ? '#008BF5' : 'transparent',
              borderWidth: '4px',
            }}
          >
            <Typography
              sx={{
                fontSize: '1.4rem',
                fontWeight: 'bold',
              }}
            >
              {title}
            </Typography>

            <Box
              component="img"
              src={imgLink}
              alt="Atlas preview img"
              sx={{
                width: '90%',
                objectFit: 'cover',
                alignSelf: 'center',
              }}
            />
            <Box sx={{
              display: 'flex', flexDirection: 'column', m: '5px ', justifyContent: 'space-evenly', height: '100%',
            }}
            >
              {AtlasInfo('Modalities', showModalities())}
              {AtlasInfo('Species', species)}
            </Box>
          </Box>
          )}
        {
          disabled
          && (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: '1.2rem',
            borderRadius: '1.2rem',
          }}
          >
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{title}</Typography>
            <Box
              component="img"
              src={imgLink}
              alt="Atlas preview img"
              sx={{
                width: '90%',
                objectFit: 'cover',
                alignSelf: 'center',
              }}
            />
            <Box sx={{
              display: 'flex', flexDirection: 'column', m: '5px ', justifyContent: 'space-evenly', height: '100%',
            }}
            >
              {AtlasInfo('Modalities', showModalities())}
              {AtlasInfo('Species', species)}
            </Box>
          </Box>
          )
        }
      </Box>
      {/* Privacy Modal */}
      <Modal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        aria-labelledby="privacy-modal-title"
        aria-describedby="privacy-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          {uploadedBy === userId && !atlas.benchmarked && (
          <Typography id="privacy-modal-title" variant="h6" component="h2">
            Now that your atlas is uploaded, you can start an atlas benchmark. 
            
            For more info on how the benchmark is done see the
            <a
              style={{
                textDecoration: "none",
              }} href="https://archmap-docu.readthedocs.io/en/latest/visualization/index.html#mapping-evaluation"><Typography sx={{
                color: colors.primary[400],
                ':hover': { color: colors.primary[500] }
              }} display="inline"> docs </Typography></a>
          </Typography>)
          }
          {uploadedBy === userId && atlas.benchmarked && (
          <Typography id="privacy-modal-title" variant="h6" component="h2">
            Your atlas benchmark has completed successfully and you can now download your results. 
            For more info on how the benchmark is done see the 
            <a
              style={{
                textDecoration: "none",
              }} href="https://archmap-docu.readthedocs.io/en/latest/visualization/index.html#mapping-evaluation"><Typography sx={{
                color: colors.primary[400],
                ':hover': { color: colors.primary[500] }
              }} display="inline"> docs </Typography></a>
          </Typography>)
          }
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => setPrivacyModalOpen(false)}>
              Cancel
            </Button>
            
            {uploadedBy === userId && (
              <>
                {!atlas.benchmarked ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBenchmarkClick(atlas)}
                  >
                    Start Benchmark
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => downloadBenchmarkClick(atlas)}
                  >
                    Download Benchmark Results
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </Modal> 
    </Box>
  );
}
