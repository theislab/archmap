export function applyModelFilters(models, searchedKeyword, searchParams, selectedAtlas) {
  const searchedModels = models.filter(
    (item) => item.name.toLowerCase().includes(searchedKeyword.toLowerCase()) && (!selectedAtlas
      || selectedAtlas.compatibleModels.some(
        (element) => element.toLowerCase() === item.name.toLowerCase(),
      )),
  );
  if (searchParams.get('sortBy') === 'name' || searchParams.get('sortBy') === null) {
    searchedModels.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }
  return searchedModels;
}

export function applyAtlasFilters(atlases, searchedKeyword, searchParams, selectedModel) {
  const searchedAtlases = atlases.filter(
    (item) => item.name.toLowerCase().includes(searchedKeyword.toLowerCase())
    && (!selectedModel
      || item.compatibleModels.some(
        (element) => element.toLowerCase() === selectedModel.name.toLowerCase(),
      )),
  );
  if (searchParams.get('sortBy') === 'name' || searchParams.get('sortBy') === null) {
    searchedAtlases.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  } else if (searchParams.get('sortBy') === 'numberOfCells') {
    searchedAtlases.sort((a, b) => a.numberOfCells - b.numberOfCells);
  }
  return searchedAtlases;
}
