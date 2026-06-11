import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAppStore } from '@/store';
import './app.scss';

function App(props) {
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  useDidShow(() => {});

  useDidHide(() => {});

  return props.children;
}

export default App;
