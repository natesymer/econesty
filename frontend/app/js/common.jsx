import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Flex, Responsive, inheritClass, cssSubclass, SVGIcon } from 'base/base';
import style from 'app/style';

function FlexControlBlock({ label, children }) {
  return (
    <Flex container row wrap alignItems="center" grow="1" marginTop marginBottom>
      <Flex className="no-select" style={style.text.ellipsis}
            container justifyContent="flex-start" alignItems="center" basis="100%" marginBottom>
        {label}
      </Flex>
      <Flex container justifyContent="flex-start" alignItems="center" basis="100%">
        {children}
      </Flex>
    </Flex>
  );
}

const SideMargins = ({ children, ...props }) =>
  <Responsive>
    { ({ sm }) => {
      props.basis = sm ? `${100 * (2/3)}%` : undefined;
      return (
        <Flex container justifyContent="center">
          <Flex {...props}>
            {children}
          </Flex>
        </Flex>
      );
    }}
  </Responsive>;

function BTC(props) {
  return <SVGIcon viewBox="0 0 384 512" path="M310.204 242.638c27.73-14.18 45.377-39.39 41.28-81.3-5.358-57.351-52.458-76.573-114.85-81.929V0h-48.528v77.203c-12.605 0-25.525.315-38.444.63V0h-48.528v79.409c-17.842.539-38.622.276-97.37 0v51.678c38.314-.678 58.417-3.14 63.023 21.427v217.429c-2.925 19.492-18.524 16.685-53.255 16.071L3.765 443.68c88.481 0 97.37.315 97.37.315V512h48.528v-67.06c13.234.315 26.154.315 38.444.315V512h48.528v-68.005c81.299-4.412 135.647-24.894 142.895-101.467 5.671-61.446-23.32-88.862-69.326-99.89zM150.608 134.553c27.415 0 113.126-8.507 113.126 48.528 0 54.515-85.71 48.212-113.126 48.212v-96.74zm0 251.776V279.821c32.772 0 133.127-9.138 133.127 53.255-.001 60.186-100.355 53.253-133.127 53.253z"/>;
}

const RedX = ({ component }) => h(component || 'span', { style: {color: "red"}, className:"fas fa-times icon" });
const GreenCheck = ({ component }) => h(component || 'span', { style: {color: "green"}, className:"fas fa-check icon" });
const Warning = ({ component }) => h(component || 'span', { style: {color: "orange"}, className:"fas fa-exclamation-triangle icon" });

function Frown({ medium, large, style, ...props }) {
  return <span {...props}
               className="far fa-frown"
               style={{ ...style, opacity: "0.4", fontSize: (large ? "10rem" : "1rem")}} />;
}

function UserRow({ element }) {
  return (
    <Flex container alignItems="center">
      <Flex component='img' src={element.avatar_url} style={style.shape.circular}
            marginRight width="1rem" height="1rem" />
      <div>{element.username}</div>
    </Flex>
  );
}

function XOverflowable({ style, ...props }) {
  return <div {...props} style={{ ...style, overflowX: "auto" }}/>;
}

export { FlexControlBlock, SideMargins, BTC, RedX, GreenCheck, Warning, UserRow, XOverflowable, Frown };
