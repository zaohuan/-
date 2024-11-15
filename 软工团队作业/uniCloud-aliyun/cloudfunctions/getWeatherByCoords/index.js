const https = require('https');

exports.main = async (event, context) => {
    const { lat, lon, OPENWEATHER_API_KEY } = event;  // 从事件参数中获取纬度和经度

    // 构建请求函数
    const getData = (url) => {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                let data = '';

                // 获取数据
                response.on('data', chunk => {
                    data += chunk;
                });

                // 数据接收完毕后解析 JSON 数据
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject('数据解析失败');
                    }
                });
            }).on('error', (e) => {
                reject(`请求错误: ${e.message}`);
            });
        });
    };

    // 构建 OpenWeather API 请求的 URL
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_cn`;
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;

    try {
        // 请求天气数据
        const weatherData = await getData(weatherUrl);

        // 请求空气质量数据
        const airData = await getData(airUrl);

        // 请求未来天气预报数据
        const forecastData = await getData(forecastUrl);

        // 返回数据给客户端
        return {
            weatherData,
            airData,
            forecastData
        };

    } catch (error) {
        console.error('Error fetching weather data:', error);
        return {
            error: '获取天气数据失败'
        };
    }
};
