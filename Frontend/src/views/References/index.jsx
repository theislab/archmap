import React, {
  useState, useEffect, useCallback, useContext,
} from 'react';
import {
  useHistory, useLocation,
  useRouteMatch,
} from 'react-router-dom';
import { Box, Button, Stack } from '@mui/material';
import { TabCard } from 'components/GeneMapper/TabCard';
import { TabGroup } from 'components/Tab';
import Search from 'components/Search';
import Filter from 'components/ReferencePageComponents/Filter';
import NavBar from 'components/NavBar';
import Breadcrumb from 'components/Breadcrumb';
import LoginForm from 'components/LoginForm';
import RegistrationForm from 'components/RegistrationForm';
import Footer from 'components/Footer';
import ScviAtlasService from 'shared/services/ScviAtlas.service';
import ModelsService from 'shared/services/Models.service';
import AtlasService from 'shared/services/Atlas.service';
import AtlasesGrid from 'components/Grids/AtlasesGrid';
import ModelsGrid from 'components/Grids/ModelsGrid';
import Mapper from 'components/Mapper';
import { applyModelFilters, applyAtlasFilters } from 'shared/utils/filter';
import ReferenceRoutes from 'components/ReferencePageComponents/ReferenceRoutes';
import { useAuth } from 'shared/context/authContext';
import { LoginContext } from 'shared/context/loginContext';
import PasswordForgetForm from 'components/PasswordForgetForm';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// import TriggerJobService from 'shared/services/TriggerJob.service';

const tmpObj = [
  {
    label: 'CORE ATLASES',
    path: '/references/atlases',
  },
  {
    label: 'SCVI-HUB ATLASES',
    path: '/references/scvi-atlases',
  },
  {
    label: 'MODELS',
    path: '/references/models',
  },
];

const References = () => {
  const [value, setValue] = useState(0);
  const [selectedAtlas, setSelectedAtlas] = useState(null);
  const [scviHubAtlases, setScviHubAtlases] = useState(null);
  const [selectedAtlasInfo, setSelectedAtlasInfo] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [mapperVisible, setMapperVisible] = useState(false);
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);
  const searchedKeyword = searchParams.get('keyword') || '';
  const { path } = useRouteMatch();
  const [atlases, setAtlases] = useState([]);
  const [models, setModels] = useState([]);
  const [user, setUser] = useAuth();
  const history = useHistory();
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

  const handleAtlasSelection = (newAtlas) => {
    setSelectedAtlas(newAtlas);
    if (!selectedModel) {
      history.push(`${path}/models`);
      setValue(1);
    }
  };

  const handleModelSelection = (newModel) => {
    setSelectedModel(newModel);
    if (!selectedAtlas) {
      history.push(`${path}/atlases`);
      setValue(0);
    }
  };

  useEffect(() => {
    AtlasService.getAtlases()
      .then((newAtlases) => setAtlases(newAtlases))
      .catch((err) => console.log(err));
    ScviAtlasService.getAtlases().then((atlases) => {
      setScviHubAtlases(atlases);
    })
    ModelsService.getModels()
      .then((newModels) => setModels(newModels))
      .catch((err) => console.log(err));
  }, []);

  const searchedKeywordChangeHandler = (value) => {
    updateQueryParams('keyword', value);
  };




  const onValueChange = (newValue) => {
    setValue(newValue);
    searchedKeywordChangeHandler('');
  };


  // Function to handle click and open a new page
  const handleAtlasClick = (atlas, num) => {

    console.log(`Model ID: ${atlas.modelIds[num].scviHubId}`)
    
    // for (let j = 0; j < atlas.scviHubId.length; j++) {
    //   console.log(`  Model: ${atlas.modelIds[j]}`);}
    // atlas.modelIds[1]

    const atlasLink = `https://huggingface.co/${atlas.modelIds[num].scviHubId}`; // Replace with a default link if no link exists
    window.open(atlasLink, '_blank'); // Open the link in a new tab
  };

  const getButtonName = (atlas, num) => {
    console.log(`Model: ${atlas.compatibleModels[num]}`)
    // Logic to determine button name based on atlas data
    return `${atlas.compatibleModels[num]}`;
  };

  const handleMap = () => {
    history.push(`/genemapper/create?atlas=${selectedAtlas._id}&model=${selectedModel._id}`);
    setMapperVisible(false);
  };

  const [expandedAtlas, setExpandedAtlas] = useState(null); // Track which atlas is expanded

  const handleAtlasClick2 = (atlas) => {
    // Toggle the expanded state for the clicked atlas
    setExpandedAtlas((prev) => (prev === atlas.name ? null : atlas.name));
  };

  useEffect(() => {
    if (selectedAtlas || selectedModel) setMapperVisible(true);
    if (!selectedAtlas && !selectedModel) setMapperVisible(false);
  }, [selectedAtlas, selectedModel]);

  const tabMenu = () => (
    <Box>

      <TabGroup value={value} onValueChange={onValueChange} tabsInfo={tmpObj} />
      {value === 0 ? (
        <AtlasesGrid
          atlases={applyAtlasFilters(atlases, searchedKeyword, searchParams, selectedModel)}
          path={path}
          handleAtlasSelection={handleAtlasSelection}
          selectedAtlas={selectedAtlas}
          selectedModel={selectedModel}
          isSearchPage={true}
        />
      ) : null}
      {value === 1 && (
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {scviHubAtlases.map((a) => (
            <Box
              key={a.name}
              style={{
                flex: '1 0 auto',
                maxWidth: '33.33%',
                minWidth: '33.33%',
                padding: '8px',
                textAlign: 'center',
              }}
            >
              <TabCard
                style={{
                  color: 'black',
                }}
                height="50px"
                data={{
                  text: a.name[0].toUpperCase() + a.name.substring(1),
                  isAtlas: true,
                }}
                isLoading={false}
                handleOnClick={() => handleAtlasClick2(a)}
              />

              {expandedAtlas === a.name && (
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => handleAtlasClick(a, 0)}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: '8px 0',
                      position: 'relative',
                      paddingRight: '30px', // Add space for the icon
                    }}
                  >
                    {getButtonName(a, 0)}
                    <OpenInNewIcon
                      sx={{
                        fontSize: 16,
                        color: 'text.secondary',
                        position: 'absolute',
                        bottom: 4,
                        right: 8,
                      }}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleAtlasClick(a, 1)}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: '8px 0',
                      position: 'relative',
                      paddingRight: '30px', // Add space for the icon
                    }}
                  >
                    {getButtonName(a, 1)}
                    <OpenInNewIcon
                      sx={{
                        fontSize: 16,
                        color: 'text.secondary',
                        position: 'absolute',
                        bottom: 4,
                        right: 8,
                      }}
                    />
                  </Button>
                  {/* <Button
                    variant="outlined"
                    // color="secondary"
                    onClick={() => handleAtlasClick(a,1)}
                    style={{ display: 'block', margin: '8px 0' }}
                  >
                     {getButtonName(a,1)}
                  </Button> */}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {value === 2 ? (
        <ModelsGrid
          models={applyModelFilters(models, searchedKeyword, searchParams, selectedAtlas)}
          path={path}
          handleModelSelection={handleModelSelection}
          selectedModel={selectedModel}
          compatibleModels={selectedAtlas && selectedAtlas.compatibleModels}
          isSearchPage={true}
        />
      ) : null}
    </Box>

  );

  const context = useContext(LoginContext);

  const onLoginClicked = () => {
    context.switchRegister(false);
    context.switchLogin(true);
  };

  const onSignUpClicked = () => {
    context.switchLogin(false);
    context.switchRegister(true);
  };

  const tmp_elems = pathname.split('/');
  const elems = tmp_elems.map((elem, index) => {
    if (index === 3) {
      if (tmp_elems[2] === 'atlases') return atlases.filter((x) => x._id === elem)[0] ? atlases.filter((x) => x._id === elem)[0].name : elem;
      if (tmp_elems[2] === 'models') return models.filter((x) => x._id === elem)[0] ? models.filter((x) => x._id === elem)[0].name : elem;
    }
    return elem;
  });

  const executeScroll = () => (user ? history.push({ pathname: '/sequencer/help' }) : history.push({ pathname: '/', state: { contact_us: true } }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // '::-webkit-scrollbar': {
          //   display: 'none',
          // },
          // height: '100vh',
          // overflow: 'auto',
        }}
      >
        {context.loginVisible && <LoginForm />}
        {context.registerVisible && <RegistrationForm />}
        {context.forgetVisible && <PasswordForgetForm />}

        <Box>
          <NavBar
            position="relative"
            onLoginClicked={onLoginClicked}
            onSignUpClicked={onSignUpClicked}
            executeScroll={executeScroll}
          />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'column', md: 'row' }}
          sx={{
            alignSelf: 'center', width: { sx: '90%', md: '60%' }, marginTop: '2%', justifyContent: 'space-between',
          }}
        >
          <Breadcrumb
            p={4}
            elems={elems}
            fontSize={1}
            actions={{ references: () => setValue(0) }}
          />
          <Box sx={{ alignSelf: 'center', width: { xs: '95%', md: '60%' }, marginBlock: '2%' }}>
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
              visible={pathname.split('/').slice(-1).includes('atlases') || pathname.split('/').slice(-1).includes('models')}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'center',
            width: { xs: '90%', md: '60%' },
          }}
        >
          {/* /references/atlases */}
          <ReferenceRoutes atlases={atlases && tabMenu()} models={models && tabMenu()} path="/references" handleSelectAtlases={handleAtlasSelection} handleSelectModels={handleModelSelection} />
        </Box>
      </Box>
      <Footer sx={{ marginTop: 'auto', transform: 'translate(0px, 100px)' }} />

      <Mapper
        mapperAtlas={selectedAtlas ? selectedAtlas.name : null}
        mapperModel={selectedModel ? selectedModel.name : null}
        handleAtlasSelection={handleAtlasSelection}
        handleModelSelection={handleModelSelection}
        open={mapperVisible}
        fabOnClick={() => setMapperVisible(!mapperVisible)}
        handleMap={handleMap}
        user={user}
      />
    </Box>
  );
};

export default References;
