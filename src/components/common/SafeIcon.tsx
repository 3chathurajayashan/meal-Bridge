import React from 'react';
import { Ionicons, MaterialCommunityIcons, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export interface SafeIconProps {
  name: string;
  type?: 'ion' | 'material' | 'feather' | 'material-icons' | 'fa5';
  size?: number;
  color?: string;
  style?: any;
}

export const SafeIcon: React.FC<SafeIconProps> = ({
  name,
  type = 'ion',
  size = 20,
  color = '#000000',
  style,
}) => {
  // Handle explicit icon types
  if (type === 'material') {
    return <MaterialCommunityIcons name={name as any} size={size} color={color} style={style} />;
  }

  if (type === 'feather') {
    return <Feather name={name as any} size={size} color={color} style={style} />;
  }

  if (type === 'material-icons') {
    return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
  }

  if (type === 'fa5') {
    return <FontAwesome5 name={name as any} size={size} color={color} style={style} />;
  }

  // Special cases for names in other icon sets
  if (name === 'bread-slice') {
    return <MaterialCommunityIcons name="bread-slice" size={size} color={color} style={style} />;
  }

  // Default to Ionicons
  return <Ionicons name={name as any} size={size} color={color} style={style} />;
};

export default SafeIcon;
