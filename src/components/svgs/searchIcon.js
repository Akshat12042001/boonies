import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

const SearchIcon = ({color = '#9AA39C', size = 16, ...props}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={1.8} />
    <Path
      d="m16 16 4 4"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export default SearchIcon;
