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

const FamilyPage: React.FC = () => {
  const [members] = useState(mockFamilyMembers);
  const [messages] = useState(mockMessages);
  const surveys = useAppStore((s) => s.surveys);
  const addHealthReport = useAppStore((s) => s.addHealthReport);
  const healthReports = useAppStore((s) => s.healthReports);
  const glucoseRecords = useAppStore((s) => s.glucoseRecords);
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
    const avgGlucose = glucoseRecords.length > 0
      ? Math.round((glucoseRecords.reduce((sum, r) => sum + r.value, 0) / glucoseRecords.length) * 10) / 10
      : 6.7;
    const highCount = glucoseRecords.filter(r => r.status === 'high' || r.status === 'danger').length;
    const lowCount = glucoseRecords.filter(r => r.status === 'low').length;

    let overallStatus = '控制良好';
    if (highCount > 3) overallStatus = '需加强管理';
    else if (highCount > 1 || lowCount > 1) overallStatus = '基本达标，仍有改善空间';

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
      summary: `近7天平均血糖 ${avgGlucose} mmol/L，${overallStatus}。偏高 ${highCount} 次，偏低 ${lowCount} 次。用药依从率 95%，运动 5 次。建议继续保持规律作息和饮食控制，注意餐后血糖波动。`,
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
