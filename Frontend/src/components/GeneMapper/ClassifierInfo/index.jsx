import React from 'react';
import { Modal } from 'components/Modal';
import { Container } from '@mui/material';
import { LearnMoreClassifierComponent } from 'views/References/LearnMoreClassifier';
/**
 * Modal displaying info about the classifier with the given classifier id
 * @param id classifier id
 * @param open True if the info modal should be shown
 * @param open Function accepting true or false as a parameter
 */
function ClassifierInfo({ id, open, setOpen }) {
  return (
    <Modal
      isOpen={open}
      setOpen={setOpen}
    >
      <Container>
        <LearnMoreClassifierComponent id={id} />
      </Container>
    </Modal>
  );
}

export default ClassifierInfo;
