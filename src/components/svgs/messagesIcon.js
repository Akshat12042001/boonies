import * as React from "react";
import Svg, { Path } from "react-native-svg";
const MessagesIcon = ({width = 24, height = 24, color = '#000'}) => (
  <Svg
    className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-q7mezt"
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill={color}
  >
    <Path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-2 12H6v-2h12zm0-3H6V9h12zm0-3H6V6h12z" />
  </Svg>
);
export default MessagesIcon;
