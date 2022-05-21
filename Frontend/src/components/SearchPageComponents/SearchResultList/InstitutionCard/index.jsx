import React from 'react';

import { Chip } from '@mui/material';
import SearchCard from '../SearchCard';
import MemberAvatars from '../MemberAvatars';

// Card to display search result for a single institution
function InstitutionCard({ item: institution }) {
  return (
    <SearchCard
      title={institution.name}
      avatar={institution.profilePictureURL}
      displayAvatar
      link={`/sequencer/institutions/${institution.id}`}
      // secondary={`updated on ${institution.updated}`}
      tertiary={(
        <>
          <MemberAvatars members={institution.memberIds} />
          <Chip
            label={`${institution.memberIds.length} members`}
            variant="outlined"
            size="small"
            sx={{ color: 'text.secondary' }}
          />
          <Chip
            label={`${institution.teamsCount} teams`}
            variant="outlined"
            size="small"
            sx={{ color: 'text.secondary' }}
          />
        </>
      )}
    />
  );
}

export default InstitutionCard;
