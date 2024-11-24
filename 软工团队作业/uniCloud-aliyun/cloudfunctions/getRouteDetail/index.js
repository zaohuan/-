'use strict';
const https = require('https');

exports.main = async (event, context) => {
  const { accessToken, routeData, modelurl } = event;
  console.log('access_token in getItineraryData(): ', accessToken);

  // 用户提供的行程数据
  const itineraryData = routeData;

  // 构建提示词，让 AI 根据上述数据生成详细行程
  const userPrompt = `
    请根据数据为用户生成具体的行程安排，输出格式为列表，列表的第一维代表第 x 天的具体行程：

    ${JSON.stringify(itineraryData, null, 2)}

    输出示例格式：
    [
      [
        {
          time: '7:30',
          spot: '酒店',
          transport: '打车24分钟',
          latitude: 26.0829,
          longitude: 119.2978
        },
        {
          time: '8:00',
          spot: '鼓山',
          transport: '打车24分钟',
          latitude: 26.0854,
          longitude: 119.3631
        },
        {
          time: '12:00',
          spot: '餐厅',
          latitude: 26.0801,
          longitude: 119.2967
        }
      ],
      [
        // 第2天的行程安排
      ]
    ]

    请为每一天生成完整的行程列表，并确保数据格式与示例一致。
  `;

  // 构建请求参数
  const params = {
    messages: [
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    top_p: 1.0,
  };

  const url = `${modelurl}?access_token=${accessToken}`;
  const requestData = JSON.stringify(params);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          console.log('响应数据:', responseData);

          const parsedData = JSON.parse(responseData);
          console.log("json响应数据：", parsedData);

          // 获取 AI 返回的结果
          let resultString = parsedData.result;

          // 去掉代码块标记
          resultString = resultString.replace(/```(?:json)?\n?([\s\S]*?)\n?```/g, '$1');

          // 解析 JSON 字符串
          let plan = [];
          try {
            plan = JSON.parse(resultString); // 解析处理后的 JSON 字符串
          } catch (e) {
            console.error('解析 result 字符串失败:', e);
          }

          // 判断解析后的数据是否有效
          if (Array.isArray(plan) && plan.length > 0) {
            // 返回解析后的行程数据
            resolve({
              statusCode: 200,
              data: { plan }
            });
          } else {
            // 如果解析数据为空或无效，返回默认数据
            console.warn('AI 返回数据为空或无效，使用默认数据');
            resolve({
              statusCode: 200,
              data: {
                plan: [
                  [
                    {
                      time: '7:30',
                      spot: '酒店',
                      transport: '打车24分钟',
                      latitude: 26.0829,
                      longitude: 119.2978
                    },
                    {
                      time: '8:00',
                      spot: '鼓山',
                      transport: '打车24分钟',
                      latitude: 26.0854,
                      longitude: 119.3631
                    },
                    {
                      time: '12:00',
                      spot: '餐厅',
                      latitude: 26.0801,
                      longitude: 119.2967
                    }
                  ],
                  [
                    // 第2天的行程安排
                  ]
                ]
              }
            });
          }
        } catch (error) {
          console.error('解析响应数据失败:', error);
          // 如果解析失败，返回默认数据
          resolve({
            statusCode: 500,
            data: {
              plan: [
                [
                  {
                    time: '7:30',
                    spot: '酒店',
                    transport: '打车24分钟',
                    latitude: 26.0829,
                    longitude: 119.2978
                  },
                  {
                    time: '8:00',
                    spot: '鼓山',
                    transport: '打车24分钟',
                    latitude: 26.0854,
                    longitude: 119.3631
                  },
                  {
                    time: '12:00',
                    spot: '餐厅',
                    latitude: 26.0801,
                    longitude: 119.2967
                  }
                ],
                [
                  // 第2天的行程安排
                ]
              ]
            }
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('请求失败:', error);
      reject({
        statusCode: 500,
        error: error.message,
      });
    });

    req.write(requestData);
    req.end();
  });
};