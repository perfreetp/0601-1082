import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import TagChip from '@/components/TagChip';
import { mockExercises, mockMedicines, glucoseTypes, getGlucoseStatus } from '@/data/glucoseRecords';
import { mealTypes } from '@/data/foods';
import { useAppStore } from '@/store';
import type { GlucoseRecord, ExerciseRecord, MedicineRecord } from '@/types/glucose';

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const GlucosePage: React.FC = () => {
  const glucoseRecords = useAppStore((s) => s.glucoseRecords);
  const addGlucoseRecord = useAppStore((s) => s.addGlucoseRecord);
  const mealRecords = useAppStore((s) => s.mealRecords);
  const getMealCarbs = useAppStore((s) => s.getMealCarbs);
  const [exercises] = useState<ExerciseRecord[]>(mockExercises);
  const [medicines] = useState<MedicineRecord[]>(mockMedicines);

  const todayStr = getTodayStr();
  const todayRecords = useMemo(
    () => glucoseRecords.filter((r) => r.date === todayStr),
    [glucoseRecords, todayStr]
  );
  const latestRecord = todayRecords.length > 0 ? todayRecords[todayRecords.length - 1] : null;

  const stats = useMemo(() => {
    if (todayRecords.length === 0) {
      return { avg: '0', high: 0, low: 0 };
    }
    const avg = (todayRecords.reduce((sum, r) => sum + r.value, 0) / todayRecords.length).toFixed(1);
    const high = todayRecords.filter(r => r.status === 'high' || r.status === 'danger').length;
    const low = todayRecords.filter(r => r.status === 'low').length;
    return { avg, high, low };
  }, [todayRecords]);

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      low: '偏低',
      normal: '正常',
      high: '偏高',
      danger: '过高',
    };
    return map[status] || '正常';
  };

  const handleAddRecord = () => {
    Taro.showActionSheet({
      itemList: glucoseTypes.map(t => `${t.icon} ${t.label}`),
      success: (res) => {
        const selectedType = glucoseTypes[res.tapIndex];
        const needsMeal = selectedType.key === 'before_meal' || selectedType.key === 'after_meal';

        if (needsMeal) {
          Taro.showActionSheet({
            itemList: mealTypes.map(m => `${m.icon} ${m.label}`),
            success: (mealRes) => {
              const selectedMeal = mealTypes[mealRes.tapIndex];
              const carbs = getMealCarbs(selectedMeal.key, todayStr);
              askGlucoseValue(selectedType, selectedMeal, carbs);
            },
          });
        } else {
          askGlucoseValue(selectedType, null, 0);
        }
      },
      fail: (err) => {
        console.error('[Glucose] 选择类型失败', err);
      },
    });
  };

  const askGlucoseValue = (glucoseType: any, mealType: any, carbs: number) => {
    const titleBase = mealType
      ? `${glucoseType.label}（${mealType.label}）`
      : glucoseType.label;
    const subTitle = mealType
      ? `\n对应${mealType.label}碳水：${Math.round(carbs)}g`
      : '';

    Taro.showModal({
      title: `记录${titleBase}血糖${subTitle}`,
      editable: true,
      placeholderText: '请输入血糖值 (mmol/L)',
      success: (modalRes) => {
        if (modalRes.confirm && modalRes.content) {
          const value = parseFloat(modalRes.content);
          if (!isNaN(value) && value > 0) {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

            const newRecord: GlucoseRecord = {
              id: Date.now().toString(),
              value,
              time: timeStr,
              date: dateStr,
              type: glucoseType.key as any,
              typeLabel: mealType ? `${mealType.label}${glucoseType.label}` : glucoseType.label,
              mealType: mealType ? mealType.key as any : undefined,
              status: getGlucoseStatus(value),
            };
            addGlucoseRecord(newRecord);
            Taro.showToast({ title: '记录成功', icon: 'success' });
            console.log('[Glucose] 新增血糖记录', { record: newRecord, carbs });
          } else {
            Taro.showToast({ title: '请输入有效数值', icon: 'none' });
          }
        }
      },
      fail: (err) => {
        console.error('[Glucose] 输入弹窗失败', err);
      },
    });
  };

  const handleAddExercise = () => {
    Taro.showToast({ title: '添加运动', icon: 'none' });
  };

  const handleAddMedicine = () => {
    Taro.showToast({ title: '添加用药', icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.overviewCard}>
        <View className={styles.overviewHeader}>
          <Text className={styles.overviewTitle}>
            <Text>🩸</Text>
            今日血糖
          </Text>
          <View className={styles.statusBadge}>
            <Text>{getStatusText(latestRecord?.status || 'normal')}</Text>
          </View>
        </View>

        <View className={styles.currentGlucose}>
          <Text className={styles.glucoseValue}>{latestRecord?.value || '--'}</Text>
          <Text className={styles.glucoseUnit}> mmol/L</Text>
          <Text className={styles.glucoseType}>{latestRecord?.typeLabel || '暂无记录'}</Text>
        </View>

        <View className={styles.overviewStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.avg}</Text>
            <Text className={styles.statLabel}>平均值</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.high}</Text>
            <Text className={styles.statLabel}>偏高次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.low}</Text>
            <Text className={styles.statLabel}>偏低次数</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>📋</Text>
            今日记录
          </Text>
          <Text className={styles.seeAll}>共 {todayRecords.length} 条</Text>
        </View>

        <View className={styles.timeline}>
          {todayRecords.map((record) => {
            const mealCarbs = record.mealType
              ? getMealCarbs(record.mealType, record.date)
              : 0;
            return (
              <View key={record.id} className={styles.recordItem}>
                <View className={classnames(styles.timeDot, styles[record.status])} />
                <View className={styles.recordContent}>
                  <Text className={styles.recordTime}>{record.time}</Text>
                  <View className={styles.recordMain}>
                    <Text className={styles.recordType}>{record.typeLabel}</Text>
                    <Text className={classnames(styles.recordValue, styles[record.status])}>
                      {record.value}
                      <Text className={styles.recordUnit}> mmol/L</Text>
                    </Text>
                  </View>
                  {record.mealType && mealCarbs > 0 && (
                    <View className={styles.recordMeta}>
                      <Text className={styles.recordMetaText}>
                        🍚 对应餐食碳水：{Math.round(mealCarbs)}g
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {todayRecords.length === 0 && (
            <View className={styles.emptyRecord}>
              <Text className={styles.emptyIcon}>📊</Text>
              <Text className={styles.emptyText}>暂无今日记录</Text>
              <Text className={styles.emptyHint}>点击右下角「+」添加第一条血糖记录</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>🏃</Text>
            运动记录
          </Text>
          <View onClick={handleAddExercise}>
            <TagChip text="+ 添加" variant="default" />
          </View>
        </View>

        <ScrollView scrollX className={styles.exerciseList}>
          {exercises.map((exercise) => (
            <View key={exercise.id} className={styles.exerciseCard}>
              <View className={styles.cardHeader}>
                <Text>🏃</Text>
                <Text className={styles.cardName}>{exercise.name}</Text>
              </View>
              <Text className={styles.cardDetail}>{exercise.time} · {exercise.duration}分钟</Text>
              <View className={classnames(styles.intensityTag, styles[exercise.intensity])}>
                <Text>{exercise.intensity === 'low' ? '低强度' : exercise.intensity === 'medium' ? '中强度' : '高强度'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>💊</Text>
            用药记录
          </Text>
          <View onClick={handleAddMedicine}>
            <TagChip text="+ 添加" variant="default" />
          </View>
        </View>

        <ScrollView scrollX className={styles.medicineList}>
          {medicines.map((medicine) => (
            <View key={medicine.id} className={styles.medicineCard}>
              <View className={styles.cardHeader}>
                <Text>💊</Text>
                <Text className={styles.cardName}>{medicine.name}</Text>
              </View>
              <Text className={styles.cardDetail}>{medicine.time} · {medicine.dosage}</Text>
              <View className={classnames(styles.intensityTag, styles.low)}>
                <Text>{medicine.type === 'insulin' ? '胰岛素' : medicine.type === 'oral' ? '口服药' : '其他'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.fab} onClick={handleAddRecord}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default GlucosePage;
