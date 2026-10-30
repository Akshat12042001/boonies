import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const SwapHorizIcon = ({size = 24, color = 'currentColor', ...props}) => (
  <Svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    {...props}>
    <Path d="M6.99 11 3 15l3.99 4v-3H14v-2H6.99zM21 9l-3.99-4v3H10v2h7.01v3z" />
  </Svg>
);

export default SwapHorizIcon;
