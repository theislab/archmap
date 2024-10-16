import React from 'react';
import {
  Switch, Route, Redirect,
} from 'react-router-dom';

import AtlasResult from 'views/References/AtlasResult';
import LearnMoreAtlas from 'views/References/LearnMoreAtlas';
import LearnMoreModel from 'views/References/LearnMoreModel';

const ReferenceRoutes = ({
  path, atlases, models, handleSelectAtlases, handleSelectModels,
}) => (
  <Switch>
    <Route
      exact
      path={`${path}/atlases`}
      render={() => atlases}
    />
    <Route
      exact
      path={`${path}/models`}
      render={() => models}
    />
    <Route exact path={`${path}/models/:id`} render={() => <LearnMoreModel handleSelect={handleSelectModels} />} />
    <Route exact path={`${path}/atlases/:id/visualization`} render={() => <AtlasResult />} />
    <Route exact path={`${path}/atlases/:id`} render={() => <LearnMoreAtlas handleSelect={handleSelectAtlases} />} />
    <Redirect to={`${path}/atlases`} />
  </Switch>
);

export default ReferenceRoutes;
