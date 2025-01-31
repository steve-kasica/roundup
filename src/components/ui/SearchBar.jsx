/**
 * SearchBar.jsx
 * ------------------------------------------
 */


import {styled} from "@mui/material/styles"
import { InputAdornment, TextField } from "@mui/material"

import { Padding, Search } from "@mui/icons-material";

const StyledComponent = styled(TextField)(({theme}) => ({
    borderRadius: "50px",
    ".MuiInputBase-root": {
        margin: "0px",
        marginTop: "1px",
        marginBottom: "1px",
        paddingLeft: "20px",
        borderRadius: "50px",
    },
    ".MuiInputBase-input": {
        paddingTop: "10px",
        paddingBottom: "10px"
    }
}));


export default function SearchBar(props) {
    return <StyledComponent 
        slotProps={{
            input: {
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
            }
        }}
        fullWidth={true}
        {...props} 
    />
}