import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface TagChipProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

const TagChip: React.FC<TagChipProps> = ({ text, variant = 'default', onClick }) => {
  return (
    <View
      className={classnames(styles.tagChip, styles[variant])}
      onClick={onClick}
    >
      <Text>{text}</Text>
    </View>
  );
};

export default TagChip;
