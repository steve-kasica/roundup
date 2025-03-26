
import { createTheme } from '@mui/material/styles';

export default createTheme({
  typography: {
      "description term": {
          color: "#555",
          fontSize: 12,
          paddingTop: "5px"
      },
      "description details": {
          fontSize: 12
      },
      "chart title": {
        fontSize: 14
      },
      "list headline": {
        fontSize: 14,
        paddingBottom: "2px",  // spacing between primary and secondary text   
        display: "block"
      },
      "list supporting text": {
        fontSize: 12,
        display: "block"
      },
      "icon text": {
        fontSize: 10
      }
  },
  components: {
      MuiTypography: {
          defaultProps: {
              variantMapping: {
                  "description term": "dt",
                  "description details": "dd"
              }
          }
      }
  }
});