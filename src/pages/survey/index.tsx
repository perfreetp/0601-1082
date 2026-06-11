import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';

const surveyQuestions = [
  {
    id: 1,
    text: '本周空腹血糖控制情况如何？',
    options: ['控制良好，基本正常', '偶尔偏高', '经常偏高', '控制很差'],
  },
  {
    id: 2,
    text: '餐后血糖波动大吗？',
    options: ['波动小，较平稳', '有时波动', '波动较大', '波动很大'],
  },
  {
    id: 3,
    text: '本周饮食控制执行情况？',
    options: ['严格执行', '基本执行', '偶尔违规', '经常违规'],
  },
  {
    id: 4,
    text: '本周运动频率如何？',
    options: ['每天运动', '每周3-5次', '每周1-2次', '基本不运动'],
  },
  {
    id: 5,
    text: '用药/胰岛素是否按时？',
    options: ['每次按时', '偶尔漏服', '经常漏服', '基本未按时'],
  },
  {
    id: 6,
    text: '本周有无低血糖发生？',
    options: ['没有', '1次', '2-3次', '3次以上'],
  },
  {
    id: 7,
    text: '睡眠质量如何？',
    options: ['很好', '较好', '一般', '较差'],
  },
  {
    id: 8,
    text: '整体精神状态如何？',
    options: ['精力充沛', '精神尚可', '容易疲劳', '非常疲惫'],
  },
];

const SurveyPage: React.FC = () => {
  const surveyId = Taro.getCurrentInstance().router?.params?.surveyId || '1';
  const completeSurvey = useAppStore((s) => s.completeSurvey);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelectOption = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    const unanswered = surveyQuestions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      Taro.showToast({
        title: `还有 ${unanswered.length} 题未作答`,
        icon: 'none',
      });
      return;
    }
    completeSurvey(surveyId, answers);
    Taro.showToast({ title: '问卷提交成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>健康问卷</Text>
        <Text className={styles.subtitle}>请根据本周实际情况如实填写，共 {surveyQuestions.length} 题</Text>
      </View>

      <View className={styles.questionList}>
        {surveyQuestions.map((question, qIndex) => (
          <View key={question.id} className={styles.questionCard}>
            <View className={styles.questionHeader}>
              <View className={styles.questionNumber}>
                <Text>{qIndex + 1}</Text>
              </View>
              <Text className={styles.questionText}>{question.text}</Text>
            </View>
            <View className={styles.optionList}>
              {question.options.map((option) => (
                <View
                  key={option}
                  className={classnames(
                    styles.optionItem,
                    answers[question.id] === option && styles.selected
                  )}
                  onClick={() => handleSelectOption(question.id, option)}
                >
                  <Text>{option}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>提交问卷</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SurveyPage;
