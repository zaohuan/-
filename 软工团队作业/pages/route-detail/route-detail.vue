<template>
  <view class="container">
    <!-- 地图区域 -->
    <view class="map-container">
      <map
        id="routeMap"
        class="map"
        :latitude="mapData.latitude"
        :longitude="mapData.longitude"
        :markers="mapData.markers"
        :polyline="mapData.polyline"
        :scale="14"
        show-location
      ></map>
    </view>

    <!-- 行程信息区域 -->
    <view class="schedule-container">
      <!-- 日期切换栏 -->
      <view class="day-tabs">
        <view 
          v-for="day in totalDays" 
          :key="day"
          :class="['day-tab', currentDay === day ? 'active' : '']"
          @click="switchDay(day)"
        >
          第{{ day }}天
        </view>
      </view>

      <!-- 时间轴行程安排 -->
      <scroll-view scroll-y class="schedule-list">
        <view class="schedule-item" v-for="(item, index) in currentSchedule" :key="index">
          <view class="time">{{ item.time }} </view>
          <view class="schedule-content">
            <view class="spot-name">{{ item.spot }}</view>
            <view class="transport" v-if="item.transport">
              <image src="/static/taxi.png" mode="aspectFit"></image>
              <text>{{ item.transport }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="bottom-buttons">
        <button class="btn" @click="addToTrip">加入我的行程</button>
        <button class="btn" @click="showDetail">详细规划</button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';


interface ScheduleItem {
  time: string
  spot: string
  transport?: string
  latitude?: number
  longitude?: number
}

interface MapData {
  latitude: number
  longitude: number
  markers: any[]
  polyline: any[]
}

export default defineComponent({
  setup() {
    const routeData = ref<any>({})
    const currentDay = ref(1)
    const totalDays = ref(2)
    const mapData = ref<MapData>({
      latitude: 26.0829,  // 福州市中心坐标
      longitude: 119.2978,
      markers: [],
      polyline: []
    })

    // 当前日程安排
    const currentSchedule = computed(() => {
      // 根据当前选中的天数返回对应的行程安排
      return scheduleData.value[currentDay.value - 1] || []
    })
	
    const scheduleData = ref<ScheduleItem[][]>([])

    // 切换日期
    const switchDay = (day: number) => {
      console.log('切换到第', day, '天')
      console.log('当前行程数据：', scheduleData.value[day - 1])
      currentDay.value = day
      updateMapRoute(day)
    }

    // 更新地图路线
    const updateMapRoute = async (day: number) => {
      const daySchedule = scheduleData.value[day - 1];
      if (!daySchedule || daySchedule.length < 2) return;
	  // 使用uniapp自带的高德地图API
	        const mapContext = uni.createMapContext('routeMap', this)
	        const origin = `${daySchedule[0].latitude},${daySchedule[0].longitude}`
	        const destination = `${daySchedule[daySchedule.length - 1].latitude},${daySchedule[daySchedule.length - 1].longitude}`
	        const waypoints = daySchedule
	          .slice(1, -1)
	          .map(item => `${item.latitude},${item.longitude}`)
	          .join(';')
      
    };

    // 添加到我的行程
    const addToTrip = () => {
      uni.showToast({
        title: '已添加到我的行程',
        icon: 'success'
      })
    }

    // 显示详细规划
    const showDetail = () => {
      uni.navigateTo({
        url: '/pages/detailed-plan/detailed-plan'
      })
    }

    onMounted(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const eventChannel = currentPage.getOpenerEventChannel()
      
      eventChannel.on('acceptRouteData', (data) => {
        console.log('接收到路线数据：', JSON.stringify(data))
        routeData.value = data
        
        // 打印确认数据
        console.log('行程数据：', scheduleData.value)
        console.log('总天数：', totalDays.value)
        
        // 处理行程数据
		uniCloud.callFunction({
		  name: 'getAccessToken',
		  success: (tokenRes) => {
		    const accessToken = tokenRes.result.data.access_token;
		    if (!accessToken) {
		      uni.showToast({
		        title: '获取AccessToken失败',
		        icon: 'none'
		      });
		      return;
		    }
		    
		    // 调用 getTuiJianJieGuo 云函数生成推荐路线
		    uniCloud.callFunction({
		      name: 'getRouteDetail',
		      data: {
		        accessToken: accessToken,
		        routeData: routeData.value,  // 传递用户的表单数据
		        modelurl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-turbo-8k'  // 替换为实际的API URL
		      },
		      success: (res) => {
		        if (res.result) {
		          scheduleData.value = res.result.data.plan || [];
				  console.log("scheduledata数据： ", scheduleData);
		        } else {
		          uni.showToast({
		            title: '未能获取有效的推荐数据',
		            icon: 'none'
		          });
		        }
		      },
		      fail: (err) => {
		        uni.showToast({
		          title: '请求失败，请稍后再试',
		          icon: 'none'
		        });
		      }
		    });
		  },
		  fail: (err) => {
		    uni.showToast({
		      title: '获取AccessToken失败',
		      icon: 'none'
		    });
		  }
		})
        totalDays.value = scheduleData.value.length
        updateMapRoute(1)
      })
    })

    return {
      currentDay,
      totalDays,
      mapData,
      currentSchedule,
      switchDay,
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
}

.map-container {
  height: 50vh;
}

.map {
  width: 100%;
  height: 100%;
}

.schedule-container {
  flex: 1;
  background: #fff;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.day-tabs {
  display: flex;
  gap: 10px;
  padding: 0 10px;
  margin-bottom: 15px;
}

.day-tab {
  padding: 8px 15px;
  border-radius: 15px;
  background: #f5f5f5;
  font-size: 14px;
}

.day-tab.active {
  background: #007AFF;
  color: #fff;
}

.schedule-list {
  flex: 1;
  overflow-y: auto;
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

.transport image {
  width: 14px;
  height: 14px;
  margin-right: 5px;
}

.bottom-buttons {
  display: flex;
  gap: 15px;
  padding: 15px 0;
}

.btn {
  flex: 1;
  background: #007AFF;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 25px;
  font-size: 14px;
}
</style> 
