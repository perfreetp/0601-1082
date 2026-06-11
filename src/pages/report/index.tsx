import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import type { HealthReport } from '@/store';

interface PostMealIssue {
  date: string;
  mealLabel: string;
  carbs: number;
  glucoseValue?: number;
  glucoseStatus?: string;
  glucoseTime?: string;
}

const ReportPage: React.FC = () => {
  const reportId = Taro.getCurrentInstance().router?.params?.reportId;
  const healthReports = useAppStore((s) => s.healthReports);
  const glucoseRecords = useAppStore((s) => s.glucoseRecords);

  const report = healthReports.find((r) => r.id === reportId);

  if (!report) {
    return (
      <View className={styles.page}>
        <View className={styles.reportCard}>
          <Text>报告未找到</Text>
        </View>
      </View>
    );
  }

  const abnormalList = report.abnormalGlucoseList || [];
  const highCarbMeals = report.highCarbMeals || [];
  const doctorAdvice = report.doctorAdvice || [];

  const postMealIssues = useMemo<PostMealIssue[]>(() => {
    const issues: PostMealIssue[] = [];
    highCarbMeals.forEach((meal) => {
      const matchedGlucose = abnormalList.find(
        (a) =>
          a.date === meal.date &&
          a.mealType === meal.mealType &&
          (a.status === 'high' || a.status === 'danger')
      );
      issues.push({
        date: meal.date,
        mealLabel: meal.mealLabel,
        carbs: meal.totalCarbs,
        glucoseValue: matchedGlucose?.value,
        glucoseStatus: matchedGlucose?.status,
        glucoseTime: matchedGlucose?.time,
      });
    });
    return issues.sort((a, b) => b.carbs - a.carbs).slice(0, 6);
  }, [highCarbMeals, abnormalList]);

  const handleShare = () => {
    const issuesText = postMealIssues.length > 0
      ? postMealIssues
          .map((issue, i) => {
            const glucoseStr = issue.glucoseValue
              ? `，餐后血糖 ${issue.glucoseValue} mmol/L（偏高）`
              : '';
            return `  ${i + 1}. ${issue.date} ${issue.mealLabel}：碳水 ${issue.carbs}g${glucoseStr}`;
          })
          .join('\n')
      : '  无明显餐后血糖波动事件';

    const abnormalHighCount = abnormalList.filter(
      (a) => a.status === 'high' || a.status === 'danger'
    ).length;
    const abnormalLowCount = abnormalList.filter((a) => a.status === 'low').length;

    const actionsText = [];
    if (abnormalHighCount > 0 && postMealIssues.length > 0) {
      actionsText.push('• 建议重点控制餐后血糖：当餐碳水控制在50g以内，优先选择低GI主食（糙米饭、燕麦粥、全麦面包）');
      actionsText.push('• 餐后30-60分钟进行轻度运动（散步15-20分钟），可降低餐后峰值1-2 mmol/L');
    }
    if (abnormalLowCount > 0) {
      actionsText.push('• 警惕低血糖：常备果汁、方糖等快速补糖食物，避免空腹剧烈运动');
    }
    actionsText.push('• 建议每日监测血糖不少于4次（空腹+三餐后2小时），做好记录');
    actionsText.push('• 持续1周血糖异常波动或出现头晕、口渴等症状，应及时就医调整用药方案');

    const mealLabelMap: Record<string, string> = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐',
    };
    const abnormalDetail = abnormalList.length > 0
      ? abnormalList.slice(0, 6).map(r =>
          `  • ${r.date} ${r.time} ${r.type}${r.mealType ? `(${mealLabelMap[r.mealType]})` : ''}：${r.value} mmol/L（${r.status === 'low' ? '偏低' : '偏高'}）`
        ).join('\n')
      : '  无异常血糖';

    const shareText = `【控糖复盘报告 · ${report.period}】
生成时间：${report.generatedAt}

━━━ 一、血糖异常情况 ━━━
偏高 ${abnormalHighCount} 次，偏低 ${abnormalLowCount} 次
平均血糖：${report.avgGlucose} mmol/L，达标率：${report.highCount === 0 ? '优秀' : report.highCount <= 2 ? '良好' : '需加强'}

异常明细：
${abnormalDetail}

━━━ 二、相关餐食分析 ━━━
共发现 ${postMealIssues.length} 餐碳水偏高（>50g），其中 ${postMealIssues.filter(i => i.glucoseValue).length} 餐伴随后续血糖偏高：
${issuesText}

━━━ 三、建议动作 ━━━
${actionsText.map((a, i) => `${i + 1}. ${a}`).join('\n')}

━━━ 四、其他健康数据 ━━━
体重：${report.avgWeight} kg · 运动：${report.exerciseCount} 次 · 用药依从：${report.medicineCompliance}%
医生建议：${doctorAdvice.length > 0 ? doctorAdvice[0] : '请遵医嘱'}

—— 由控糖助手生成，仅供参考，具体诊疗请遵医嘱`;

    Taro.setClipboardData({
      data: shareText,
      success: () => {
        Taro.showModal({
          title: '分享内容已复制',
          content: '复盘报告已按「血糖异常-相关餐食-建议动作」整理为结构化文本，可直接粘贴给医生或亲友查看。',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#10B981',
        });
      },
      fail: () => {
        Taro.showModal({
          title: '控糖复盘报告',
          content: shareText,
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#10B981',
        });
      },
    });
    console.log('[Report] 分享报告', report.id, shareText);
  };

  const handleClose = () => {
    Taro.switchTab({ url: '/pages/family/index' });
  };

  const overallRating = report.highCount === 0 ? '优秀' : report.highCount <= 2 ? '良好' : '需加强';

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.reportCard}>
        <View className={styles.reportHeader}>
          <Text className={styles.reportTitle}>📊 控糖复盘报告</Text>
          <Text className={styles.reportTime}>生成时间：{report.generatedAt}</Text>
          <Text className={styles.reportPeriod}>{report.period}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>🩸</Text>
            血糖概览
          </Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.primary)}>
                {report.avgGlucose}
              </Text>
              <Text className={styles.statLabel}>平均血糖 (mmol/L)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.warning)}>
                {report.highCount}
              </Text>
              <Text className={styles.statLabel}>偏高次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.error)}>
                {report.lowCount}
              </Text>
              <Text className={styles.statLabel}>偏低次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.success)}>
                {overallRating}
              </Text>
              <Text className={styles.statLabel}>综合评级</Text>
            </View>
          </View>
        </View>

        {postMealIssues.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text>�</Text>
              餐后复盘 · 餐食与血糖关联
            </Text>
            <Text className={styles.sectionSubTitle}>
              以下餐次碳水偏高，建议重点关注餐后血糖波动
            </Text>
            <View className={styles.postMealList}>
              {postMealIssues.map((issue, idx) => (
                <View key={idx} className={styles.postMealItem}>
                  <View className={styles.postMealHeader}>
                    <Text className={styles.postMealDate}>
                      {issue.date} · {issue.mealLabel}
                    </Text>
                    {issue.glucoseValue ? (
                      <Text
                        className={classnames(
                          styles.postMealGlucose,
                          styles[issue.glucoseStatus || 'high']
                        )}
                      >
                        血糖 {issue.glucoseValue} ↑
                      </Text>
                    ) : (
                      <Text className={styles.postMealGlucoseOK}>暂无餐后记录</Text>
                    )}
                  </View>
                  <View className={styles.postMealStats}>
                    <View className={styles.postMealStatBar}>
                      <Text className={styles.postMealStatLabel}>碳水</Text>
                      <View className={styles.postMealBarTrack}>
                        <View
                          className={classnames(
                            styles.postMealBarFill,
                            issue.carbs >= 70 ? styles.danger : issue.carbs >= 50 ? styles.warning : styles.normal
                          )}
                          style={{ width: `${Math.min(100, (issue.carbs / 80) * 100)}%` }}
                        />
                      </View>
                      <Text className={styles.postMealStatValue}>{issue.carbs}g</Text>
                    </View>
                  </View>
                  {issue.glucoseValue && (
                    <View className={styles.postMealHint}>
                      <Text className={styles.postMealHintText}>
                        💡 建议：下一餐减少 {Math.max(10, Math.round((issue.carbs - 45) / 10) * 10)}g 碳水，或餐后散步 15 分钟
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {abnormalList.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text>⚠️</Text>
              异常血糖记录
            </Text>
            <View className={styles.abnormalList}>
              {abnormalList.slice(0, 6).map((item, idx) => (
                <View key={idx} className={styles.abnormalItem}>
                  <View className={styles.abnormalLeft}>
                    <Text className={styles.abnormalDate}>{item.date}</Text>
                    <Text className={styles.abnormalTime}>{item.time}</Text>
                  </View>
                  <View className={styles.abnormalCenter}>
                    <Text className={styles.abnormalType}>{item.type}</Text>
                  </View>
                  <View className={styles.abnormalRight}>
                    <Text className={classnames(styles.abnormalValue, styles[item.status])}>
                      {item.value}
                    </Text>
                    <Text className={styles.abnormalUnit}>mmol/L</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {highCarbMeals.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text>🍚</Text>
              高碳水餐次（&gt;50g）
            </Text>
            <View className={styles.highCarbList}>
              {highCarbMeals.slice(0, 5).map((meal, idx) => (
                <View key={idx} className={styles.highCarbItem}>
                  <View className={styles.highCarbInfo}>
                    <Text className={styles.highCarbTitle}>
                      {meal.date} · {meal.mealLabel}
                    </Text>
                    <Text className={styles.highCarbMeta}>{meal.foodCount} 种食物</Text>
                  </View>
                  <View className={styles.highCarbValue}>
                    <Text className={styles.highCarbNumber}>{meal.totalCarbs}</Text>
                    <Text className={styles.highCarbUnit}>g 碳水</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {doctorAdvice.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text>👨‍⚕️</Text>
              医生建议
            </Text>
            <View className={styles.doctorAdviceList}>
              {doctorAdvice.map((advice, idx) => (
                <View key={idx} className={styles.adviceItem}>
                  <View className={styles.adviceNum}>{idx + 1}</View>
                  <Text className={styles.adviceText}>{advice}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>�</Text>
            健康概况
          </Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.primary)}>
                {report.avgWeight}
              </Text>
              <Text className={styles.statLabel}>平均体重 (kg)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.success)}>
                {report.exerciseCount}
              </Text>
              <Text className={styles.statLabel}>运动次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.primary)}>
                {report.medicineCompliance}%
              </Text>
              <Text className={styles.statLabel}>用药依从率</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.success)}>
                {glucoseRecords.length}
              </Text>
              <Text className={styles.statLabel}>记录总条数</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>�📝</Text>
            AI 评估总结
          </Text>
          <Text className={styles.summaryText}>{report.summary}</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.shareBtn} onClick={handleShare}>
          <Text>📤 分享给医生</Text>
        </View>
        <View className={styles.closeBtn} onClick={handleClose}>
          <Text>完成查看</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
