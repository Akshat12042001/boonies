import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

const InfoIcon = ({color = '#2F6FED', size = 16, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.7} />
    <Path
      d="M12 11v5"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <Circle cx={12} cy={8} r={1} fill={color} />
  </Svg>
);

export default InfoIcon;
