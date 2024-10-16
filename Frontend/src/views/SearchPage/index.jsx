import React, { useCallback, useState, useEffect } from 'react';
import { Box, Stack, CircularProgress } from '@mui/material';
import {
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

import styles from './search.module.css';
import SearchTabs from 'components/SearchPageComponents/SearchTabs';
import SearchContent from 'components/SearchPageComponents/SearchContent';
import Filter from 'components/SearchPageComponents/Filter';
import Search from 'components/Search';
import UserService from 'shared/services/User.service';
import TeamService from 'shared/services/Team.service';
import InstitutionService from 'shared/services/Institution.service';

import { useAuth } from 'shared/context/authContext';
import ProjectService from 'shared/services/Project.service';
import AtlasService from 'shared/services/Atlas.service';
import ModelService from 'shared/services/Model.service';

import { applyModelFilters, applyAtlasFilters } from 'shared/utils/filter';
import HeaderView from 'components/general/HeaderView';
import { GiConsoleController } from 'react-icons/gi';

const SearchPage = () => {
  const [user] = useAuth();

  // state managed in path and query params
  const history = useHistory();
  const { search } = useLocation();
  const { path } = useRouteMatch();

  const searchParams = new URLSearchParams(search);

  // category of the searched items (teams/institutions/users)
  const { searchCategory } = useParams();
  const searchedKeyword = searchParams.get('keyword') || '';

  const [searchRequestResult, setSearchRequestResult] = useState([]);
  const [loadedCategory, setLoadedCategory] = useState('');

  // check if searchRequestResult is of the requested category
  const isLoading = loadedCategory !== searchCategory;

  // function to update the state in the URL
  const updateQueryParams = (param, value) => {
    const params = new URLSearchParams(history.location.search);
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }

    history.push({
      pathname: history.location.pathname,
      search: params.toString(),
    });
  };

  const searchedKeywordChangeHandler = (value) => {
    updateQueryParams('keyword', value);
  };

  const fetchSearchHandler = useCallback(async () => {
    try {
      let searchResponse = [];
      const urlParams = new URLSearchParams(searchParams);
      const filterParams = Object.fromEntries(urlParams);
      switch (searchCategory) {
        case 'users':
          let res = await UserService.getUsers(filterParams);
          // only show users that are not temporary
          searchResponse = res.filter(obj => obj.note !== "temporary_user");
          break;
        case 'teams':
          searchResponse = await TeamService.getTeams(filterParams);
          break;
        case 'institutions':
          searchResponse = await InstitutionService.getInstitutions(filterParams);
          break;
        case 'projects':
          searchResponse = await ProjectService.getProjects(filterParams);
          break;
        case 'atlases':
          searchResponse = await AtlasService.getAtlases();
          searchResponse = applyAtlasFilters(searchResponse, filterParams.keyword || '', urlParams);
          break;
        case 'models':
          searchResponse = await ModelService.getModels();
          searchResponse = applyModelFilters(searchResponse, filterParams.keyword || '', urlParams);
          break;
        default:
      }
      setSearchRequestResult(searchResponse);
    } catch (e) {
      setSearchRequestResult([]);
      console.log(e);
    } finally {
      setLoadedCategory(searchCategory);
    }
  }, [searchCategory, search]);

  useEffect(() => {
    fetchSearchHandler();
  }, [fetchSearchHandler]);

  return (
    <HeaderView title="Search">
      <Box sx={{ margin: 'auto', maxWidth: 1200 }}>
        <Box sx={{ width: { xs: '100%', sm: '100%', md: '40%' }, marginBlock: '2%' }}>
          <Search
            filterComponent={(
              <Filter
                searchParams={searchParams}
                updateQueryParams={updateQueryParams}
                path={path}
              />
            )}
            handleSearch={searchedKeywordChangeHandler}
            value={searchedKeyword}
            padding="0px"
          />
        </Box>
        <SearchTabs
          value={searchCategory}
          searchParams={searchParams}
          path={path}
        />
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        {!isLoading && (
          <SearchContent
            searchResult={searchRequestResult}
            searchCategory={searchCategory}
            searchedKeyword={searchedKeyword}
            user={user}
            fetchSearchHandler={fetchSearchHandler}
          />
        )}
      </Box>
    </HeaderView>
  );
};

export default SearchPage;
