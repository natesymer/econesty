/*
  These are the styles Base uses to style _all_ elements.
*/

// This is not directly CSS. These apply on the
// Component level, not the DOM level.
var BaseStyles = {
  elementHeight: "2.5rem",
  padding:       "0.5rem",
  border: {
    radius: "0.25rem", // padding / 2
    width:  "0.1rem"
  },
  table: {
    
  },
  loading: {
    color:     "#555555",
    thickness: "0.5rem"
  },
  input: { // component styles for <Input /> & <Select />
    color:               "#000000",
    placeholderColor:    "#777777",
    backgroundColor:     "#FFFFFF",
    disabledColor:       "#CAD2D3",
    borderColor:         "#CCCCCC",
    selectedBorderColor: "#129FEA",
    invalidBorderColor:  "#B94A48"
  }
};

export default BaseStyles;
