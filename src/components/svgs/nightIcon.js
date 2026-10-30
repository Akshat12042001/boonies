import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const NightIcon = ({size = 24, color = 'currentColor', ...props}) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill={color} {...props}>
    <Path d="M12.1 22c-5.2 0-9.4-4.1-9.4-9.2 0-4.3 3-7.9 7-9 0.3-0.1 0.6 0.2 0.5 0.5-0.6 2.1-0.2 4.4 1.2 6.1 1.5 1.8 3.8 2.7 6.1 2.5 0.3 0 0.5 0.3 0.4 0.6-1.1 3.4-4.3 5.5-7.8 5.5z" />
  </Svg>
);

export default NightIcon;
