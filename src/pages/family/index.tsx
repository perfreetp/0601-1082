import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import {
  mockFamilyMembers,
  mockMessages,
  mockHealthSummary,
} from '@/data/family';
import { useAppStore } from '@/store';
import type { HealthReport } from '@/store';

const FamilyPage: React.FC = () => {
  const [members] = useState(mockFamilyMembers);
  const [messages] = useState(mockMessages);
  const surveys = useAppStore((s) => s.surveys);
  const addHealthReport = useAppStore((s) => s.addHealthReport);
  const healthReports = useAppStore((s) => s.healthReports);
  const glucoseRecords = useAppStore((s) => s.glucoseRecords);
  const mealRecords = useAppStore((s) => s.mealRecords);
  const getMealCarbs = useAppStore((s) => s.getMealCarbs);
  const summary = mockHealthSummary;

  const handleEmergency = () => {
    Taro.showModal({
      title: '紧急提醒',
      content: '确认向所有紧急联系人发送健康提醒？',
      confirmText: '确认发送',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已发送紧急提醒', icon: 'success' });
          console.log('[Family] 发送紧急提醒');
        }
      },
      fail: (err) => {
        console.error('[Family] 紧急提醒弹窗失败', err);
      },
    });
  };

  const handleExport = () => {
    const today = new Date();
    const dateList: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateList.push(`${y}-${m}-${day}`);
    }

    const recentRecords = glucoseRecords.filter((r) => dateList.includes(r.date));
    const avgGlucose = recentRecords.length > 0
      ? Math.round((recentRecords.reduce((sum, r) => sum + r.value, 0) / recentRecords.length) * 10) / 10
      : 6.7;
    const highCount = recentRecords.filter(r => r.status === 'high' || r.status === 'danger').length;
    const lowCount = recentRecords.filter(r => r.status === 'low').length;

    const abnormalList = recentRecords
      .filter(r => r.status === 'high' || r.status === 'danger' || r.status === 'low')
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
      .slice(0, 10)
      .map(r => ({
        date: r.date,
        time: r.time,
        value: r.value,
        type: r.typeLabel,
        mealType: r.mealType,
        status: r.status,
      }));

    const mealLabelMap: Record<string, string> = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐',
    };
    const highCarbMeals: HealthReport['highCarbMeals'] = [];
    dateList.forEach(date => {
      const dayRecord = mealRecords[date];
      if (!dayRecord) return;
      Object.keys(dayRecord).forEach(mealKey => {
        const foods = dayRecord[mealKey];
        const carbs = foods.reduce((sum, f) => sum + f.carbs, 0);
        if (carbs > 50) {
          highCarbMeals.push({
            date,
            mealType: mealKey,
            mealLabel: mealLabelMap[mealKey] || mealKey,
            totalCarbs: Math.round(carbs * 10) / 10,
            foodCount: foods.length,
          });
        }
      });
    });
    highCarbMeals.sort((a, b) => b.totalCarbs - a.totalCarbs);
    const topHighCarb = highCarbMeals.slice(0, 5);

    let overallStatus = '控制良好';
    if (highCount > 5) overallStatus = '需加强管理';
    else if (highCount > 2 || lowCount > 2) overallStatus = '基本达标，仍有改善空间';

    const doctorAdvice = [
      '建议每日监测血糖至少4次（空腹、早午晚餐后2小时），如有低血糖症状及时补糖并记录。',
      highCarbMeals.length > 0
        ? `近期有 ${highCarbMeals.length} 餐碳水偏高（>50g），建议减少精制主食，增加膳食纤维摄入。`
        : '碳水化合物摄入量控制较好，继续保持主食定量的习惯。',
      '餐后30-60分钟建议进行轻度运动（如散步15-20分钟），有助于降低餐后血糖峰值。',
      '保持规律作息，每晚睡眠时间建议7-8小时，熬夜会影响胰岛素敏感性。',
      '按时按量服用降糖药物/胰岛素，不要自行调整剂量，如有疑问请咨询主治医生。',
    ];

    const summary = `近7天平均血糖 ${avgGlucose} mmol/L，${overallStatus}。偏高 ${highCount} 次，偏低 ${lowCount} 次。${topHighCarb.length > 0 ? `发现 ${topHighCarb.length} 餐碳水偏高，建议重点关注。` : '饮食控制总体较好。'} 用药依从率 95%，运动 5 次。建议继续保持规律作息，注意餐后血糖波动。`;

    const report: HealthReport = {
      id: Date.now().toString(),
      generatedAt: new Date().toLocaleString('zh-CN'),
      period: '近7天',
      avgGlucose,
      highCount,
      lowCount,
      avgWeight: 67.5,
      exerciseCount: 5,
      medicineCompliance: 95,
      summary,
      abnormalGlucoseList: abnormalList,
      highCarbMeals: topHighCarb,
      doctorAdvice,
    };

    addHealthReport(report);
    Taro.navigateTo({ url: `/pages/report/index?reportId=${report.id}` });
    console.log('[Family] 生成健康报告', report);
  };

  const handleSurveyClick = (surveyId: string, status: string) => {
    if (status === 'completed') {
      Taro.showToast({ title: '该问卷已完成', icon: 'none' });
      return;
    }
    if (status === 'expired') {
      Taro.showToast({ title: '该问卷已过期', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: `/pages/survey/index?surveyId=${surveyId}` });
  };

  const handleViewReport = (reportId: string) => {
    Taro.navigateTo({ url: `/pages/report/index?reportId=${reportId}` });
  };

  const handleAddMember = () => {
    Taro.showToast({ title: '添加亲友', icon: 'none' });
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      normal: '状态良好',
      warning: '需关注',
      danger: '异常',
    };
    return map[status] || '正常';
  };

  const getSurveyStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待完成',
      completed: '已完成',
      expired: '已过期',
    };
    return map[status] || status;
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.summaryCard}>
        <View className={styles.summaryHeader}>
          <Text className={styles.summaryTitle}>
            <Text>👨‍👩‍👧</Text>
            健康摘要
          </Text>
          <Text className={styles.summaryPeriod}>{summary.period}</Text>
        </View>

        <View className={styles.summaryMain}>
          <Image
            className={styles.patientAvatar}
            src={mockFamilyMembers[0].avatar}
            mode="aspectFill"
          />
          <View className={styles.patientInfo}>
            <Text className={styles.patientName}>{mockFamilyMembers[0].name}</Text>
            <View className={styles.patientStatus}>
              <View className={styles.statusDot} />
              <Text>{getStatusText(summary.glucoseStatus)}</Text>
            </View>
          </View>
        </View>

        <View className={styles.summaryStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{summary.avgGlucose}</Text>
            <Text className={styles.statLabel}>平均血糖</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{summary.exerciseCount}</Text>
            <Text className={styles.statLabel}>运动次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{summary.medicineCompliance}%</Text>
            <Text className={styles.statLabel}>用药依从</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{summary.highCount}</Text>
            <Text className={styles.statLabel}>高血糖次</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>👥</Text>
            关注的人
          </Text>
          <Text className={styles.seeAll}>管理</Text>
        </View>

        <ScrollView scrollX className={styles.memberList}>
          {members.map((member) => (
            <View key={member.id} className={styles.memberItem}>
              <View className={styles.memberAvatar}>
                <Image
                  src={member.avatar}
                  style={{ width: '100%', height: '100%', borderRadius: '999rpx' }}
                  mode="aspectFill"
                />
                {member.role === 'patient' && (
                  <View className={styles.memberStatusDot} />
                )}
              </View>
              <Text className={styles.memberName}>{member.name}</Text>
              <Text className={styles.memberRelation}>{member.relation}</Text>
            </View>
          ))}
          <View className={styles.addMember} onClick={handleAddMember}>
            <Text>+</Text>
          </View>
        </ScrollView>
      </View>

      <View className={styles.actionGrid}>
        <View className={classnames(styles.actionCard, styles.emergency)} onClick={handleEmergency}>
          <Text className={styles.actionIcon}>🚨</Text>
          <Text className={styles.actionTitle}>紧急提醒</Text>
          <Text className={styles.actionDesc}>一键通知紧急联系人</Text>
        </View>
        <View className={styles.actionCard} onClick={handleExport}>
          <Text className={styles.actionIcon}>📄</Text>
          <Text className={styles.actionTitle}>数据导出</Text>
          <Text className={styles.actionDesc}>生成健康报告</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>💬</Text>
            留言板
          </Text>
          <Text className={styles.seeAll}>全部</Text>
        </View>

        <View className={styles.messageList}>
          {messages.map((msg) => (
            <View key={msg.id} className={styles.messageItem}>
              <Image
                className={styles.messageAvatar}
                src={msg.senderAvatar}
                mode="aspectFill"
              />
              <View className={styles.messageContent}>
                <View className={styles.messageHeader}>
                  <Text className={styles.messageSender}>{msg.senderName}</Text>
                  <Text className={styles.messageTime}>{msg.time}</Text>
                </View>
                <Text className={classnames(styles.messageText, msg.isEmergency && styles.emergency)}>
                  {msg.isEmergency && <Text className={styles.emergencyBadge}>紧急</Text>}
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>�</Text>
            健康报告记录
          </Text>
          <Text className={styles.seeAll}>共 {healthReports.length} 份</Text>
        </View>

        {healthReports.length === 0 ? (
          <View className={styles.emptyCard}>
            <Text className={styles.emptyIcon}>📄</Text>
            <Text className={styles.emptyText}>暂无健康报告</Text>
            <Text className={styles.emptyHint}>点击上方"数据导出"生成您的第一份健康摘要报告</Text>
          </View>
        ) : (
          <View className={styles.reportList}>
            {healthReports.map((report) => (
              <View
                key={report.id}
                className={styles.reportItem}
                onClick={() => handleViewReport(report.id)}
              >
                <View className={styles.reportItemIcon}>📊</View>
                <View className={styles.reportItemInfo}>
                  <Text className={styles.reportItemTitle}>健康摘要报告</Text>
                  <View className={styles.reportItemMeta}>
                    <Text>{report.generatedAt}</Text>
                    <Text>平均血糖 {report.avgGlucose}</Text>
                  </View>
                </View>
                <View className={styles.reportItemArrow}>›</View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>��</Text>
            医生问卷
          </Text>
          <Text className={styles.seeAll}>全部</Text>
        </View>

        <View className={styles.surveyList}>
          {surveys.map((survey) => (
            <View
              key={survey.id}
              className={styles.surveyItem}
              onClick={() => handleSurveyClick(survey.id, survey.status)}
            >
              <View className={styles.surveyInfo}>
                <Text className={styles.surveyTitle}>{survey.title}</Text>
                <View className={styles.surveyMeta}>
                  <Text>{survey.doctorName}</Text>
                  <Text>{survey.questionsCount} 题</Text>
                  <Text>截止 {survey.dueDate}</Text>
                </View>
              </View>
              <View className={classnames(styles.surveyStatus, styles[survey.status])}>
                <Text>{getSurveyStatusText(survey.status)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default FamilyPage;
