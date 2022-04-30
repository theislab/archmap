import React from 'react';
import styles from './header.module.css';
import { Link } from 'react-router-dom';
import ProfileImage from 'components/ProfileImage';

function Header({
  title,
  rightOfTitle,
  replaceRight,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {rightOfTitle}
      </div>
      <div className={styles.right}>
        {replaceRight == null
          ? (
            <Link to="/sequencer/settings">
              <ProfileImage sizePixels={42} />
            </Link>
          ) : replaceRight}
      </div>
    </header>
  );
}

export default Header;
