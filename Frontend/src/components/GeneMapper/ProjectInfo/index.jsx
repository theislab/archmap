import React, { useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import AtlasInfo from '../AtlasInfo';
import ModelInfo from '../ModelInfo';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
/**
 * Displays information about the given project
 * @param project Object containing project data
 * @param atlas Object containing atlas data
 * @param model Object containing model data
 */
function ProjectInfo({ project, atlas, model }) {
  const [atlasInfoOpen, setAtlasInfoOpen] = useState(false);
  const [modelInfoOpen, setModelInfoOpen] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return mb.toFixed(2) + ' MB';
    } else {
      return (mb / 1024).toFixed(2) + ' GB';
    }
  };

  return (
    <>
      <Typography>
        {`Atlas: ${atlas?.name}`}
        {atlas?._id && <IconButton size="small" onClick={() => setAtlasInfoOpen(true)}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>}
      </Typography>
      <Typography>
        {`Model: ${model?.name}`}
        {model?._id && <IconButton size="small" onClick={() => setModelInfoOpen(true)}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>}
      </Typography>
      <Typography>{`Dataset: ${project?.fileName}`}</Typography>
      {project?.resultSize > 0 && (
        <Typography>{`Result Size: ${formatBytes(project.resultSize)}`}</Typography>
      )}
      {atlas?._id
      && <AtlasInfo id={atlas._id} open={atlasInfoOpen} setOpen={setAtlasInfoOpen} />}
      {model?._id
      && <ModelInfo id={model._id} open={modelInfoOpen} setOpen={setModelInfoOpen} />}
    </>
  );
}

export default ProjectInfo;
