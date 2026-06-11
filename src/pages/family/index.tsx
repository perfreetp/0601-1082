import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import TagChip from '@/components/TagChip';
import {
  mockFamilyMembers,
  mockMessages,
  mockSurveys,
  mockHealthSummary,
} from '@/data/family';

const FamilyPage: React.FC = () => {
  const [members] = useState(mockFamilyMembers);
  const [messages] = useState(mockMessages);
  const [surveys] = useState(mockSurveys);
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
    Taro.showActionSheet({
      itemList: ['导出为 PDF 报告', '导出为 Excel 表格', '分享给医生'],
      success: (res) => {
        Taro.showToast({ title: '正在生成报告...', icon: 'loading' });
        console.log('[Family] 导出数据', res.tapIndex);
        setTimeout(() => {
          Taro.showToast({ title: '导出成功', icon: 'success' });
        }, 1500);
      },
      fail: (err) => {
        console.error('[Family] 导出操作失败', err);
      },
    });
  };

  const handleSurveyClick = (survey: typeof mockSurveys[0]) => {
    if (survey.status === 'pending') {
      Taro.showToast({ title: `开始填写${survey.title}`, icon: 'none' });
    } else {
      Taro.showToast({ title: '查看问卷结果', icon: 'none' });
    }
    console.log('[Family] 点击问卷', survey);
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
            <Text>📋</Text>
            医生问卷
          </Text>
          <Text className={styles.seeAll}>全部</Text>
        </View>

        <View className={styles.surveyList}>
          {surveys.map((survey) => (
            <View
              key={survey.id}
              className={styles.surveyItem}
              onClick={() => handleSurveyClick(survey)}
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
