import { getAllProjectMetadata } from "./get-all-project-metadata";
import { getColumnsInfo } from "./get-columns-info";
import { getProjectModels } from "./get-project-models";
import renameColumn from "./rename-column";

const api = {
    getAllProjectMetadata,
    getColumnsInfo,
    getProjectModels,
    renameColumn
};

export default api;