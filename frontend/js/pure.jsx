import React from 'react';
import PropTypes from 'prop-types';

function guid() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + [s4(), s4(), s4(), s4(), s4()].join('-') + s4() + s4();
}

function makeClassName() {
  var parts = [];
  for (var i = 0; i < arguments.length; i++) {
    parts = parts.concat((arguments[i] || '').split(' '));
  }
  return parts.filter(e => e.length > 0).join(' ');
}

function inheritClass(comp, cname) {
  return props => {
    var propsp = Object.assign({}, props, { className: makeClassName(props.className, cname) });
    return React.createElement(comp, propsp, props.children);
  }
}

function sizeProp(props, propName, componentName) {
  if (!props[propName]) return undefined;
  if (!/^(\d+)(?:-(\d+))?$/.test(props[propName])) {
    return new Error(
      'Invalid sizeProp `' + propName + '` supplied to' + ' `' + componentName + '`.'
    );
  }
  return undefined;
}

const Image = inheritClass('img', "pure-image");
const Grid = inheritClass('div', 'pure-g');
const MenuHeading = inheritClass('span', 'pure-menu-heading');
const MenuLink = inheritClass('a', 'pure-menu-link');
const MenuList = inheritClass('ul', 'pure-menu-list');
const ButtonGroup = inheritClass('div', 'pure-button-group');

const GridUnit = props => {
  const sizes = ["sm", "md", "lg", "xl"];
  var classNames = ['pure-u-' + props.size].concat(
    sizes.filter(k => k in props)
         .map(k => 'pure-u-' + k + '-' + props[k])
  );
  const {sm, md, lg, xl, size, children, ...filteredProps} = props; // eslint-disable-line
  return React.createElement(inheritClass('div', classNames.join(' ')), filteredProps, children);
};

GridUnit.propTypes = {
  sm: sizeProp,
  md: sizeProp,
  lg: sizeProp,
  xl: sizeProp,
  size: sizeProp
};

GridUnit.defaultProps = {
  size: '1'
};

const Button = props => {
  const {primary, active, children, ...filteredProps} = props;
  var className = 'pure-button';
  if (primary) className += " pure-button-primary";
  if (active) className += " pure-button-active";
  return React.createElement(inheritClass(props.href ? 'a' : 'button', className), filteredProps, children);
};

Button.propTypes = {
  primary: PropTypes.bool,
  active: PropTypes.bool
};

Button.defaultProps = {
  primary: false,
  active: false
};

const Table = props => {
  const {bordered, horizontal, striped, children, ...filteredProps} = props;

  var classes = ['table-fill', 'pure-table'];
  if (bordered) classes.push('pure-table-bordered');
  if (horizontal) classes.push('pure-table-horizontal');
  if (striped) classes.push('pure-table-striped');

  return React.createElement(inheritClass('table', classes.join(' ')), filteredProps, striped ? applyStriping(children) : children);
};

function applyStriping(children) {
  var odd = true;
  return React.Children.map(children, function(child) {
    var {...newProps} = child.props;
    if (child.type === "tbody") {
      newProps.children = applyStriping(newProps.children);
    } else if (child.type === "tr") {
      if (odd) newProps.className = makeClassName(newProps.className, 'pure-table-odd');
      odd = !odd;
    }
    return React.cloneElement(child, newProps, newProps.children);
  });
}

Table.propTypes = {
  bordered: PropTypes.bool,
  horizontal: PropTypes.bool,
  striped: PropTypes.bool
};

Table.defaultProps = {
  bordered: false,
  horizontal: false,
  striped: false
};

const Menu = props => {
  const {horizontal, scrollable, fixed, children, ...filteredProps} = props;
  var className = 'pure-menu';
  if (horizontal) className += ' pure-menu-horizontal';
  if (scrollable) className += ' pure-menu-scrollable';
  if (fixed)      className += ' pure-menu-fixed';
  return React.createElement(inheritClass('div', className), filteredProps, children);
};

Menu.propTypes = {
  horizontal: PropTypes.bool,
  scrollable: PropTypes.bool,
  fixed: PropTypes.bool
};

Menu.defaultProps = {
  horizontal: false,
  scrollable: false,
  fixed: false
};

const MenuItem = props => {
  var className = 'pure-menu-item';
  if (props.disabled) className += ' pure-menu-disabled';
  if (props.selected) className += ' pure-menu-selected';
  return React.createElement(inheritClass('li', className), props, props.children);
};

MenuItem.propTypes = {
  disabled: PropTypes.bool,
  selected: PropTypes.bool
};

MenuItem.defaultProps = {
  disabled: false,
  selected: false
}

// Forms can take props.object as form value defaults.

const Element = props => {
  if (props.select) {
    var defaultValue = guid();
    return (
      <div className={props.wrapperClass}>
        <select name={props.name} defaultValue={props.value || defaultValue}>
          {props.label !== null && <option disabled hidden value={defaultValue}>{props.label}</option>}
          {props.select.map(s => <option key={guid()} value={s}>{s}</option>)}
        </select>
      </div>
    )
  }
  var typ = props.hidden ? "hidden" : props.text ? "text" : props.checkbox ? "checkbox" : props.password ? "password" : props.type;
  const {hidden, text, checkbox, password, wrapperClass, label, type, email, url, select, ...filteredProps} = props; // eslint-disable-line
  return (
    <div className={props.wrapperClass}>
      <input type={typ} {...filteredProps} />
      {props.label !== null && <label>{props.label}</label>}
      {props.message !== null && <span className="pure-form-message">{props.message}</span>}
    </div>
  );
};

Element.propTypes = {
  required: PropTypes.bool,
  hidden: PropTypes.bool,
  text: PropTypes.bool,
  checkbox: PropTypes.bool,
  password: PropTypes.bool,
  email: PropTypes.bool,
  url: PropTypes.bool,
  select: PropTypes.arrayOf(PropTypes.any),
  type: PropTypes.oneOf(["hidden", "text", "checkbox", "password", "hidden"]),
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  label: PropTypes.string,
  wrapperClass: PropTypes.string
};

Element.defaultProps = {
  required: false,
  hidden: false,
  text: false,
  checkbox: false,
  password: false,
  email: false,
  url: false,
  select: null,
  type: "hidden",
  value: undefined,
  label: null,
  wrapperClass: ""
};

function findForm(btn) {
  var btnp = btn;
  while (btnp) {
    if (btnp.dataset.isForm) {
      break;
    }
    btnp = btnp.parentElement;
  }
  return btnp;
}

const SubmitButton = props => {
  return <Button primary onClick={e => props.onSubmit(Form.reduceForms(findForm(e.target)))}>{props.children}</Button>;
};

SubmitButton.propTypes = {
  onSubmit: PropTypes.func
};

SubmitButton.defaultProps = {
  onSubmit: () => undefined
};

const Form = props => {
  const {aligned, stacked, className, subForm, object, children, ...filteredProps} = props;
  var cns = ["pure-form"];
  if (aligned) cns.push("pure-form-aligned");
  if (stacked) cns.push("pure-form-stacked");
  if (className) cns.push(className);
  return Form.setObject(object,
    <div {...filteredProps} data-is-form data-is-subform={subForm} className={cns.join(' ')}>
      <fieldset>
        {children}
      </fieldset>
    </div>
  );
};

Form.propTypes = {
  name: PropTypes.string,
  object: PropTypes.object,
  subForm: PropTypes.bool,
  aligned: PropTypes.bool,
  stacked: PropTypes.bool
};

Form.defaultProps = {
  name: null,
  object: null,
  subForm: false,
  aligned: false,
  stacked: false
};

// operates on DOM elements
Form.reduceForms = function(el, acc = {}) {
  if (!el) return acc;
  Array.from(el.children).forEach(child => {
    const tname = child.tagName.toLowerCase();
    if (child.dataIsForm)   child.dataIsSubform ? acc[child.name] = Form.reduceForms(child) : Form.reduceForms(child, acc);
    if (tname === "input")  acc[child.name] = child.value;
    if (tname === "select") {
      var opt = child.children[child.selectedIndex];
      if (!opt.hidden) acc[child.name] = opt.value;
    } else                  Form.reduceForms(child, acc);
  });
  return acc;
};

// operates on ReactDOM elements
Form.setObject = function(obj, form) {
  if (obj) {
    return React.cloneElement(form, form.props, React.Children.map(form.props.children, c => {
      if (c.props.dataIsForm && c.props.dataIsSubform) {
        return Form.setObject(obj[c.props.name], c);
      }

      if (!c.props.dataIsForm && c.props.name) {
        return React.cloneElement(c, {defaultValue: obj[c.props.name], key: guid()}, c.props.children);
      }
      return c;
    }));
  }
  return form;
}

export { guid, Image, Grid, GridUnit, Button, ButtonGroup, Table, Menu, MenuHeading, MenuLink, MenuList, MenuItem, Element, SubmitButton, Form };
export default {
  guid: guid,
  Image: Image,
  Grid: Grid,
  GridUnit: GridUnit,
  Button: Button,
  ButtonGroup: ButtonGroup,
  Table: Table,
  Menu: Menu,
  MenuHeading: MenuHeading,
  MenuLink: MenuLink,
  MenuList: MenuList,
  MenuItem: MenuItem,
  Element: Element,
  SubmitButton: SubmitButton,
  Form: Form
};
