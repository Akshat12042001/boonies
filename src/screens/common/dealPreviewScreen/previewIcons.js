import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

const ICON_COLOR = '#2F6B3A';

export const MoonIcon = ({color = '#4A5C50', size = 16, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M16.5 14.5A6.5 6.5 0 0 1 9 5.2 7 7 0 1 0 16.5 14.5Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

export const GuestsGlyph = ({color = '#4A5C50', size = 16, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={9} cy={8} r={2.4} stroke={color} strokeWidth={1.6} />
    <Path
      d="M4.5 18c.5-2.6 2.3-4 4.5-4s4 1.4 4.5 4"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <Circle cx={16} cy={8.5} r={2} stroke={color} strokeWidth={1.6} />
    <Path
      d="M15.2 14.2c1.6.3 2.8 1.4 3.3 3.3"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
);

export const MountainIcon = ({color = ICON_COLOR, size = 18, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M3 18.5 8.8 9.2l3.2 4.2 2.2-3 6.8 8.1H3Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

export const GiftIcon = ({color = ICON_COLOR, size = 18, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect x={4} y={10} width={16} height={9} rx={1.5} stroke={color} strokeWidth={1.6} />
    <Path d="M4 14h16M12 10v9" stroke={color} strokeWidth={1.6} />
    <Path
      d="M12 10c-1.2-2.6-4.4-2.8-4.4-.6S10.2 10 12 10Zm0 0c1.2-2.6 4.4-2.8 4.4-.6S13.8 10 12 10Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

export const AwardIcon = ({color = ICON_COLOR, size = 18, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={12} cy={9} r={4.2} stroke={color} strokeWidth={1.6} />
    <Path
      d="m9.2 12.6-1.2 6.2L12 16.6l4 2.2-1.2-6.2"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

export const PlaneIcon = ({color = ICON_COLOR, size = 18, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="m4 12 16-7-4.2 16-3.3-5.2L4 12Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path d="M12.5 15.8 11 19" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

export const ShieldIcon = ({color = ICON_COLOR, size = 18, ...props}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 3.8 19 6.4v5.3c0 4-2.8 6.8-7 8.5-4.2-1.7-7-4.5-7-8.5V6.4L12 3.8Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="m9.2 12.1 1.8 1.8 3.8-4"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
