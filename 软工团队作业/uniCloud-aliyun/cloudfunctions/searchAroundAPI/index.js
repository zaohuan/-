// 云函数入口文件
/*
参数说明
https://lbs.amap.com/api/lightmap/guide/localsearch
*/

const axios = require('axios'); // 需要安装 axios 库

exports.main = async (event, context) => {
  const { locations, keywords, defaultIndex, searchRadius } = event;  // 从前端传递的参数中提取

  // 验证必要的参数是否存在
  if (!locations || !keywords) {
    return {
      success: false,
      message: '缺少必要的参数: locations, keywords'
    };
  }

  // 构造请求 URL
  const amapUrl = `https://m.amap.com/around/?locations=${locations}&keywords=${keywords}&defaultIndex=${defaultIndex || 1}&searchRadius=${searchRadius || 5000}&key=fc3c6e846fefdab859fd1ebf42729dac&jscode=5ee8a6eb6e5eb6313947acf3e6ae18eb`;

  try {
    // 使用 axios 发起 HTTP 请求
    const response = await axios.get(amapUrl);
    
    // 返回 HTML 内容
    if (response.status === 200) {
      return {
        success: true,
        data: response.data // 返回的 HTML 内容
      };
    } else {
      return {
        success: false,
        message: 'API 返回失败'
      };
    }
  } catch (error) {
    console.error('调用高德地图 API 失败:', error);
    return {
      success: false,
      message: '请求失败，请稍后再试'
    };
  }
};
