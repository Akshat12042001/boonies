import React from 'react';
import Svg, {Path} from 'react-native-svg';

const HourglassIcon = ({color = '#C9A227', size = 18, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M7.5 4h9M7.5 20h9"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <Path
      d="M8 4.5c.2 3.6 3.2 4.4 4 7.5.8 3.1-3.6 4-4 7.5M16 4.5c-.2 3.6-3.2 4.4-4 7.5-.8 3.1 3.6 4 4 7.5"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default HourglassIcon;
