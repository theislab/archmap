import React from "react";

import { Chip } from "@mui/material";
import SearchCard from "../SearchCard";
import LabeledLink from "../LabeledLink";

// Card to display search result for a single project
const ProjectCard = ({ item: project }) => {
  return (
    <SearchCard
      title={project.name}
      link={`/sequencer/projects/${project.id}`}
      primary={<Chip label={project.type} color="primary" size="small" />}
      tertiary={
        <React.Fragment>
          {project.institution && <LabeledLink label={"Institution"} content={project.institution} />}
          {project.team && <LabeledLink label={"Team"} content={project.team} />}
        </React.Fragment>
      }
    />
  );
};

export default ProjectCard;
