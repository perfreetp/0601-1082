import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subText?: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subText,
  icon,
  variant = 'default',
}) => {
  return (
    <View className={classnames(styles.statCard, styles[variant])}>
      <View className={styles.header}>
        <Text className={styles.label}>{label}</Text>
        {icon && <Text className={styles.icon}>{icon}</Text>}
      </View>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {subText && <Text className={styles.subText}>{subText}</Text>}
    </View>
  );
};

export default StatCard;
