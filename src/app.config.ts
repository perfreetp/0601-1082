export default defineAppConfig({
  pages: [
    'pages/camera/index',
    'pages/plate/index',
    'pages/glucose/index',
    'pages/trends/index',
    'pages/family/index',
    'pages/suggestion/index',
    'pages/plan/index',
    'pages/survey/index',
    'pages/report/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '糖伴 AI',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F0FDF4'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#10B981',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/camera/index',
        text: '拍照'
      },
      {
        pagePath: 'pages/plate/index',
        text: '餐盘'
      },
      {
        pagePath: 'pages/glucose/index',
        text: '血糖'
      },
      {
        pagePath: 'pages/trends/index',
        text: '趋势'
      },
      {
        pagePath: 'pages/family/index',
        text: '家庭'
      }
    ]
  }
})
