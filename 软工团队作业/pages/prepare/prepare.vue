<!-- PTR-FR-002 -->
<template>
  <view class="container">
    <!-- 推荐路线列表 -->
    <view class="route-list">
      <view class="route-card" 
            v-for="(route, index) in prepareRoutes" 
            :key="index"
            @click="navigateToDetail(route)">
        <view class="route-title">{{ route.title }}</view>
        <view class="route-path">
          <template v-for="(spot, spotIndex) in route.spots" :key="spotIndex">
            <text>{{ spot.name }}</text>
            <text v-if="spotIndex !== route.spots.length - 1"> → </text>
          </template>
        </view>
        <button 
          class="adjust-btn" 
          @click.stop="handleAdjust(route)"
        >智能调整</button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

interface SpotItem {
  name: string
  isAdjusted?: boolean  // 可选,用于标记调整后的景点
}

interface RouteItem {
  title: string        // 路线标题
  spots: SpotItem[]    // 景点数组
}

export default defineComponent({
  setup() {
    const prepareRoutes = ref<RouteItem[]>([
      {
        title: '豪华尊享游',
        spots: [
          { name: '鼓山' },
          { name: '三坊七巷' },
          { name: '达明美食街' }
        ]
      },
      {
        title: '经济适用游',
        spots: [
          { name: '鼓山' },
          { name: '闽江公园' },
          { name: '万达广场/老街' }
        ]
      },
      {
        title: '特种兵穷游',
        spots: [
          { name: '青云山' },
          { name: '鼓山' },
          { name: '达明美食街' }
        ]
      }
    ])

    const navigateToDetail = (route: RouteItem) => {
      uni.navigateTo({
        url: '/pages/route-detail/route-detail',
        success: (res) => {
          res.eventChannel.emit('acceptRouteData', route)
        }
      })
    }

    const handleAdjust = (route: RouteItem) => {
      uni.navigateTo({
        url: '/pages/prepareres/prepareres',
        success: (res) => {
          res.eventChannel.emit('acceptRouteData', route)
        }
      })
    }

    // 处理表单数据并生成推荐路线
    const generateRecommendations = (formData: any) => {
      // 如果需要根据表单数据更新路线，可以在这里更新 prepareRoutes.value
      console.log('处理表单数据:', formData)
    }

    onMounted(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const eventChannel = currentPage.getOpenerEventChannel()
      
      eventChannel.on('acceptFormData', (data) => {
        console.log('接收到的表单数据：', data)
        generateRecommendations(data)
      })
    })

    return {
      prepareRoutes,
      navigateToDetail,
      handleAdjust
    }
  }
})
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f5f5f5;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.route-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
}

.route-title {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.route-path {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.adjust-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 0;
  font-size: 16px;
  width: 100%;
  margin-top: 10px;
}

.adjust-btn:active {
  background-color: #357abd;
}
</style> 
