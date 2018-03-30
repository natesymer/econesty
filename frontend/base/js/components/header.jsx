import { h } from 'preact'; // eslint-disable-line no-unused-vars
import { Link, Flex } from 'base/base';
import PropTypes from 'prop-types';

function Header({ menuElements, title }) {
  return (
    <Flex container wrap justifyContent="space-between" alignItems="center" className="header">
      <Flex margin component={Link} href="/" className="heading">{title}</Flex>
      <Flex container wrap row alignItems="center" margin>{menuElements}</Flex>
    </Flex>
  );
}

Header.defaultProps = {
  menuElements: []
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  menuElements: PropTypes.arrayOf(PropTypes.node)
};

export { Header };
export default Header;
