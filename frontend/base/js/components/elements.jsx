import { h, render, cloneElement } from 'preact'; // eslint-disable-line no-unused-vars
import { inheritClass, cssSubclass } from './utilities';

const Error = inheritClass("div", "error");
const XOverflowable = inheritClass("div", "xoverflowable");

const DeleteButton = inheritClass("a", "fa fa-times delete-button");
const SearchIcon = inheritClass("span", "fa fa-search search-icon");
const Frown = inheritClass(cssSubclass("span", {
  large: 'frown-icon-large',
  medium: 'frown-icon-medium'
}), "far fa-frown frown-icon");

const Button = inheritClass(cssSubclass(props => props.href ? 'a' : 'button', {
  primary: 'button-primary'
}), 'button');

const Table = cssSubclass('table', {
  selectable: 'table-selectable',
  striped: 'table-striped'
});



export { Button, Table, Error, DeleteButton, SearchIcon, XOverflowable, Frown };

export default {
  Button: Button,
  Table: Table,
  Error: Error,
  DeleteButton: DeleteButton,
  SearchIcon: SearchIcon,
  XOverflowable: XOverflowable,
  Frown: Frown
};
