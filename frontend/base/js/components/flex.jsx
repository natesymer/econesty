import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import BaseStyles from '../style.js';

function measurement(props, propName, componentName) {
  let typ = typeof props[propName];
  if (typ !== 'string' && typ !== 'number') {
    return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`);
  }
  return undefined;
}

function Flex({ style, component,
                container, justifyContent, row, rowReverse, column, columnReverse, // container props
                wrap, nowrap, wrapReverse, alignContent, alignItems,               // more container props
                order, grow, shrink, basis, align, justify,                        // item props
                height, width,                                                     // sizing props
                paddingLeft, paddingRight, paddingTop, paddingBottom, padding,     // padding
                marginLeft, marginRight, marginTop, marginBottom, margin,          // margin
                 ...props}) {
  let stylep = {...style};
  if (container) {
    stylep.display = "flex";
    let direction = row ? "row" : rowReverse ? "row-reverse" : column ? "column" : columnReverse ? "column-reverse" : undefined;
    let wrapV = wrap ? "wrap" : wrapReverse ? "wrap-reverse" : nowrap ? "nowrap" : undefined;
    if (justifyContent) stylep.justifyContent = justifyContent;
    if (direction) stylep.flexDirection = direction;
    if (wrapV) stylep.flexWrap = wrapV;
    if (alignContent) stylep.alignContent = alignContent;
    if (alignItems) stylep.alignItems = alignItems;
  }

  let hasGrow = grow !== null && grow !== undefined;
  let hasShrink = shrink !== null && shrink !== undefined;
  let hasBasis = basis !== null && basis !== undefined;
  if (order !== null && order !== undefined) stylep.order = order;
  if (hasGrow && hasShrink && hasBasis) {
    stylep.flex = `${grow} ${shrink} ${basis}`;
  } else {
    if (hasGrow) stylep.flexGrow = grow;
    if (hasShrink) stylep.flexShrink = shrink;
    if (hasBasis) stylep.flexBasis = basis;
  }
  if (align !== null && align !== undefined) stylep.alignSelf = align;
  if (justify !== null && justify !== undefined) stylep.justifySelf = justify;
  if (height !== null && height !== undefined) stylep.height = height;
  if (width !== null && width !== undefined) stylep.width = width;

  if (padding) stylep.padding = BaseStyles.padding;
  else {
    if (paddingLeft) stylep.paddingLeft = BaseStyles.padding;
    if (paddingRight) stylep.paddingRight = BaseStyles.padding;
    if (paddingTop) stylep.paddingTop = BaseStyles.padding;
    if (paddingBottom) stylep.paddingBottom = BaseStyles.padding;
  }
  if (margin) stylep.margin = BaseStyles.padding;
  else {
    if (marginLeft) stylep.marginLeft = BaseStyles.padding;
    if (marginRight) stylep.marginRight = BaseStyles.padding;
    if (marginTop) stylep.marginTop = BaseStyles.padding;
    if (marginBottom) stylep.marginBottom = BaseStyles.padding;
  }

  if (Object.keys(stylep).length > 0) props.style = stylep;

  return h(component, props);
}

Flex.defaultProps = {
  component: 'div',
  style: {},
  container: false,
  padding: false,
  paddingTop: false,
  paddingBottom: false,
  paddingRight: false,
  paddingLeft: false,
  margin: false,
  marginTop: false,
  marginBottom: false,
  marginLeft: false,
  marginRight: false
};

Flex.propTypes = {
  component: PropTypes.func, // A react component
  style: PropTypes.object,
  container: PropTypes.bool,
  justifyContent: PropTypes.oneOf([
    "flex-start",
    "flex-end",
    "center",
    "space-between",
    "space-around",
    "space-evenly"
  ]),
  row: PropTypes.bool,
  rowReverse: PropTypes.bool,
  column: PropTypes.bool,
  columnReverse: PropTypes.bool,
  wrap: PropTypes.bool,
  wrapReverse: PropTypes.bool,
  nowrap: PropTypes.bool,
  alignContent: PropTypes.oneOf([
    "flex-start",
    "flex-end",
    "center",
    "stretch",
    "space-between",
    "space-around"
  ]),
  alignItems: PropTypes.oneOf([
    "flex-start",
    "flex-end",
    "center",
    "stretch",
    "baseline"
  ]),
  order: PropTypes.number,
  grow: PropTypes.number,
  shrink: PropTypes.number,
  basis: PropTypes.oneOfType([
    measurement,
    PropTypes.oneOf([
      "auto",
      "content",
      "fill",
      "max-content",
      "min-content",
      "fit-content"
    ])
  ]),
  align: PropTypes.oneOf([
    "auto",
    "flex-start",
    "flex-end",
    "center",
    "stretch",
    "baseline"
  ]),
  width: PropTypes.string,
  height: PropTypes.string,
  padding: PropTypes.bool,
  paddingTop: PropTypes.bool,
  paddingBottom: PropTypes.bool,
  paddingLeft: PropTypes.bool,
  paddingRight: PropTypes.bool,
  margin: PropTypes.bool,
  marginRight: PropTypes.bool,
  marginLeft: PropTypes.bool,
  marginTop: PropTypes.bool,
  marginBottom: PropTypes.bool
};

export { Flex };
export default Flex;
