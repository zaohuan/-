<template>
  <view class="container">
    <view class="map-section">
      <web-view 
        class="map-container"
        id="map-webview"
        :webview-styles="{ progress: true }"
        :src="mapUrl"
        @message="handleMessage"
      ></web-view>
    </view>

    <cover-view class="schedule-container">
      <cover-view class="day-tabs">
        <cover-view class="day-text">第</cover-view>
        <cover-view 
          v-for="day in totalDays" 
          :key="day"
          :class="['day-tab', currentDay === day ? 'active' : '']"
          @tap="switchDay(day)"
        >
          {{ day }}
        </cover-view>
        <cover-view class="day-text">天</cover-view>
      </cover-view>

      <cover-view class="schedule-list">
        <cover-view class="schedule-item" v-for="(item, index) in currentSchedule" :key="index">
          <cover-view class="time">{{ item.time }}</cover-view>
          <cover-view class="schedule-content">
            <cover-view class="spot-name">{{ item.spot }}</cover-view>
            <cover-view class="transport" v-if="item.transport">
              <cover-image src="/static/taxi.png" class="transport-icon"></cover-image>
              <cover-view class="transport-text">{{ item.transport }}</cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
      </cover-view>

      <cover-view class="bottom-buttons">
        <cover-view class="btn" @tap="addToTrip">加入我的行程</cover-view>
        <cover-view class="btn" @tap="showDetail">详细规划</cover-view>
      </cover-view>
    </cover-view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'

// 声明 uni 的类型
declare const uni: any;
declare const getCurrentPages: any;
declare const plus: any;

interface ScheduleItem {
  time: string
  spot: string
  transport?: string
  latitude?: number
  longitude?: number
}

interface RouteItem {
  title: string
  spots: any[]
  budget: string
}

export default defineComponent({
  setup() {
    const routeData = ref<RouteItem>()
    const currentDay = ref(1)
    const totalDays = ref(1)
    const scheduleData = ref<ScheduleItem[][]>([])
    const mapUrl = ref('/static/map.html')
    const formData = ref<any>({})

    // 当前日程安排
    const currentSchedule = computed(() => {
      return scheduleData.value[currentDay.value - 1] || []
    })

    // 切换日期
    const switchDay = (day: number) => {
      currentDay.value = day
      
      // 将数据转换为纯对象
      const data = {
        scheduleData: scheduleData.value.map(daySchedule => 
          daySchedule.map(item => ({
            time: item.time,
            spot: item.spot,
            transport: item.transport,
            latitude: item.latitude,
            longitude: item.longitude
          }))
        ),
        currentDay: currentDay.value
      }
      
      // 使用 JSON 序列化和反序列化确保数据可以被克隆
      const safeData = JSON.parse(JSON.stringify(data))
      
      // 获取当前页面
      const pages = getCurrentPages()
      const page = pages[pages.length - 1]
      // @ts-ignore
      const currentWebview = page.$getAppWebview()
      
      // 获取web-view组件
      // @ts-ignore
      const webviewId = currentWebview.children()[0]
      console.log(currentWebview, currentWebview.children(),currentWebview.children()[0]);
	  
      if (webviewId) {
        webviewId.setStyle({
          width: '100%',
          height: '50vh'
        })
        // 发送消息到web-view
        webviewId.evalJS(`
          initMap(${JSON.stringify(safeData.scheduleData)}, ${safeData.currentDay});
        `)
        console.log('发送数据到地图:', safeData)
      }
    }

    // 获取细行程数据
    const getDetailedSchedule = (routeData: any, formData: any) => {
      uni.showLoading({
        title: '获取行程详情'
      })

      uniCloud.callFunction({
        name: 'getAccessToken',
        success: (tokenRes) => {
          const accessToken = tokenRes.result.data.access_token
          if (!accessToken) {
            uni.showToast({
              title: '获取AccessToken失败',
              icon: 'none'
            })
            return
          }

          uniCloud.callFunction({
            name: 'getRouteDetail',
            data: {
              accessToken: accessToken,
              routeData: routeData,
              formData: formData
            },
            timeout: 120000,
            success: (res) => {
              console.log('getRouteDetail response:', res)
              
              if (res.result && res.result.data && res.result.data.schedule) {
                scheduleData.value = res.result.data.schedule
                totalDays.value = scheduleData.value.length
                switchDay(1)
              } else {
                console.error('Invalid response data:', res)
                uni.showToast({
                  title: '获取行程详情失败',
                  icon: 'none'
                })
              }
            },
            fail: (err) => {
              console.error('调用云函数失败:', err)
              uni.showToast({
                title: '请求失败，请稍后再试',
                icon: 'none'
              })
            },
            complete: () => {
              uni.hideLoading()
            }
          })
        },
        fail: (err) => {
          uni.hideLoading()
          uni.showToast({
            title: '获取AccessToken失败',
            icon: 'none'
          })
        }
      })
    }

    // 添加到我的行程
    const addToTrip = () => {
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo) {
        uni.showToast({
          title: '用户未登录',
          icon: 'none'
        })
        return;
      }

      uniCloud.callFunction({
        name: 'addToTrip',
        data: {
          scheduleData: scheduleData.value,
          userInfo : userInfo
        },
        success: (res) => {
          if (res.result && res.result.success) {
            uni.showToast({
              title: '已添加到我的行程',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: '添加行程失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('添加行程失败:', err)
          uni.showToast({
            title: '请求失败，请稍后再试',
            icon: 'none'
          })
        }
      })
    }

    // 显示详细规划
    const showDetail = () => {
      uni.navigateTo({
        url: '/pages/detailed-plan/detailed-plan'
      })
    }

    // 处理web-view消息
    const handleMessage = (event: any) => {
      console.log('收到web-view消息:', event.detail)
    }

    onMounted(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const eventChannel = currentPage.getOpenerEventChannel()
      
      eventChannel.on('acceptRouteData', (data: any) => {
        console.log('接收到路线数据：', JSON.stringify(data))
        routeData.value = data
        
        // 构造路线参数
        const routeParams = {
          title: data.title || '',
          spots: Array.isArray(data.spots) ? data.spots : [],  // 确保是数组
          budget: data.budget || ''
        }
        
        // 构造表单数据
        const defaultFormData = {
          destination: '福州',  // 设置默认值
          startDate: new Date().toISOString().split('T')[0],  // 今天
          endDate: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],  // 明天
        }
        
        console.log('处理后的路线参数：', routeParams)
        // 调用获取详细行程的方法
        getDetailedSchedule(routeParams, defaultFormData)
      })
    })

    return {
      mapUrl,
      currentDay,
      totalDays,
      currentSchedule,
      switchDay,
      handleMessage,
      addToTrip,
      showDetail
    }
  }
})
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.map-section {
  flex: none;
  height: 50vh;
  max-height: 50vh;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100% !important;
}

.schedule-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 55vh;
  margin-top: -50px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  z-index: 999;
}

.day-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin: 0 0 10px 0;
  height: 50px;
}

.day-text {
  font-size: 16px;
  color: #333;
  margin: 0 5px;
  line-height: 30px;
}

.day-tab {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin: 0 5px;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.day-tab.active {
  background: #007AFF;
  color: #fff;
}

.schedule-list {
  flex: 1;
  overflow-y: scroll;
  padding-right: 10px;
  margin-bottom: 10px;
  max-height: calc(100% - 120px);
}

.schedule-item {
  display: flex;
  margin-bottom: 20px;
}

.time {
  width: 60px;
  color: #666;
  font-size: 14px;
}

.schedule-content {
  flex: 1;
  padding-left: 15px;
  border-left: 1px solid #eee;
}

.spot-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.transport {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 12px;
}

.transport-icon {
  width: 14px;
  height: 14px;
  margin-right: 5px;
}

.bottom-buttons {
  display: flex;
  padding: 10px 0;
  background: #fff;
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
}

.btn {
  flex: 1;
  margin: 0 7.5px;
  background: #007AFF;
  color: #fff;
  text-align: center;
  
  padding: 12px;
  border-radius: 25px;
  font-size: 14px;
}
</style>
