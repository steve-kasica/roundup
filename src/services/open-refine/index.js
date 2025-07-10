import { getAllProjectMetadata } from "./get-all-project-metadata";
import { getColumnsInfo } from "./get-columns-info";
import { getProjectModels } from "./get-project-models";
import renameColumn from "./rename-column";
import removeColumn from "./remove-column";
import reorderColumns from "./reorder-columns";
import computeFacets from "./compute-facets";
import getRows from "./get-rows";

const api = {
  getAllProjectMetadata,
  getColumnsInfo,
  getProjectModels,
  renameColumn,
  removeColumn,
  reorderColumns,
  computeFacets,
  getRows,
};

export default api;
