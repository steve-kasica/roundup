import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import HighlightText from "../../ui/HighlightText";
import { Chip, Typography } from "@mui/material";
import {
  formatDate,
  formatNumber,
  parseOpenRefineDate,
} from "../../../lib/utilities";

// export default function TableRowView({searchString, table}) {
export default function TableRowView({ table, searchString = "" }) {
  const {
    parentId,
    name,
    rowCount,
    columnCount,
    dateCreated,
    dateLastModified,
    tags,
  } = table;
  // const isDisabled = [table.name].join("^").indexOf(searchString) < 0;
  const isDisabled = false; // Placeholder for actual disabled logic
  const isSelected = false;

  return (
    <>
      <td>{isSelected ? <CheckBox /> : <CheckBoxOutlineBlank />}</td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          <HighlightText pattern={searchString} text={name} />
        </Typography>
      </td>
      <td>
        {tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" />
        ))}
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          {formatNumber(rowCount)}
        </Typography>
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          {formatNumber(columnCount)}
        </Typography>
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          {formatDate(parseOpenRefineDate(dateCreated))}
        </Typography>
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          {formatDate(parseOpenRefineDate(dateLastModified))}
        </Typography>
      </td>
    </>
  );
}

// function SearchableField({text}) {
//     const searchString = useSelector(getSearchString);
//     return (
//         <Typography>
//             <HighlightText pattern={searchString} text={text} />
//         </Typography>
//     );
// }
