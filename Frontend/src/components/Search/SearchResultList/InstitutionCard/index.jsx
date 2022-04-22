import React from "react";

import { Chip } from "@mui/material";
import SearchCard from "../SearchCard";
import Avatars from "components/Avatars";

const InstitutionCard = ({ item: institution }) => {
  return (
    <SearchCard
      title={institution.name}
      secondary={`updated on ${institution.updated}`}
      tertiary={
        <React.Fragment>
          <Avatars
            items={institution.members.map(({ name, image }) => {
              return { src: image, alt: name };
            })}
          />
          <Chip
            label={`${institution.membersCount} members`}
            variant="outlined"
            size="small"
            sx={{ color: "text.secondary" }}
          />
          <Chip
            label={`${institution.teamsCount} teams`}
            variant="outlined"
            size="small"
            sx={{ color: "text.secondary" }}
          />
        </React.Fragment>
      }
    />
  );
};

export default InstitutionCard;
