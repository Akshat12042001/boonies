import React from 'react';
import Svg, {Path} from 'react-native-svg';

const CloseCircleIcon = ({color = '#E08A3C', size = 18, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 3.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Z"
      stroke={color}
      strokeWidth={1.6}
    />
    <Path
      d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

export default CloseCircleIcon;
