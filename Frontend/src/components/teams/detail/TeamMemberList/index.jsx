import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import MemberList from 'components/members/MemberList';
import TeamMemberRemoveButton from '../TeamMemberRemoveButton';
import styles from './teamMemberList.module.css';
import { useAuth } from 'shared/context/authContext';

function TeamMemberList({ team }) {
  const [user] = useAuth();

  if (!team.adminIds?.length || !team.memberIds?.length) {
    return <CircularProgress />;
  }

  return (
    <MemberList
      memberIds={[...team.adminIds, ...team.memberIds]}
      nextToNameBuilder={(member) => (
        <span className={styles.accessRightIndicator}>
          {team.adminIds.indexOf(member.id) !== -1 ? 'admin' : 'member'}
        </span>
      )}
      trailingBuilder={(member) => (
        team.adminIds.includes(user.id) && user.id === member.id ? null : (
          <TeamMemberRemoveButton team={team} member={member} />
        )
      )}
    />
  );
}

export default TeamMemberList;
