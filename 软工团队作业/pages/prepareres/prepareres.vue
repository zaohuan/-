<template>
  <view class="container">
    <!-- 调整后的路线列表 -->
    <view class="route-list">
      <view class="route-card" 
            v-for="(route, index) in adjustedRoutes" 
            :key="index"
            @click="navigateToDetail(route)">
        <view class="route-title">{{ route.title }}</view>
        <view class="route-path">
          <template v-for="(spot, spotIndex) in route.spots" :key="spotIndex">
            <text 
              :class="{'adjusted-spot': spot.isAdjusted}"
            >{{ spot.name }}</text>
            <text v-if="spotIndex !== route.spots.length - 1"> → </text>
          </template>
        </view>
      </view>
    </view>

    <!-- 调整说明 -->
    <view class="adjustment-note">
      <view class="note-title">调整说明</view>
      <view class="note-content">
        <text>{{ adjustmentNote }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

interface SpotItem {
  name: string
  isAdjusted: boolean
}

interface RouteItem {
  title: string
  spots: SpotItem[]
}

export default defineComponent({
  setup() {
    const adjustedRoutes = ref<RouteItem[]>([
      {
        title: '豪华尊享游',
        spots: [
          { name: '鼓山', isAdjusted: false },
          { name: '福州博物馆', isAdjusted: true },
          { name: '达明美食街', isAdjusted: false }
        ]
      },
      {
        title: '经济适用游',
        spots: [
          { name: '鼓山', isAdjusted: false },
          { name: '林则徐纪念馆', isAdjusted: true },
          { name: '万达广场', isAdjusted: false }
        ]
      },
      {
        title: '特种兵穷游',
        spots: [
          { name: '青云山', isAdjusted: false },
          { name: '海峡文化艺术中心', isAdjusted: true },
          { name: '达明美食街', isAdjusted: false }
        ]
      }
    ])

    const adjustmentNote = ref('由于14:00-16:00期间可能有雷阵雨，建议将户外景点调整为室内景点，以确保行程顺利进行。蓝色标记为调整项。')

    const navigateToDetail = (route: RouteItem) => {
      uni.navigateTo({
        url: '/pages/route-detail/route-detail',
        success: (res) => {
          res.eventChannel.emit('acceptRouteData', route)
        }
      })
    }

    const adjustRoute = (originalRoute: RouteItem) => {
      // 室内景点替换表
      const indoorSpots: { [key: string]: string } = {
        '三坊七巷': '福州博物馆',
        '西湖公园': '林则徐纪念馆',
        '鼓山': '海峡文化艺术中心'
      }

      return {
        title: originalRoute.title,
        spots: originalRoute.spots.map(spot => {
          if (indoorSpots[spot.name]) {
            return {
              name: indoorSpots[spot.name],
              isAdjusted: true
            }
          }
          return {
            name: spot.name,
            isAdjusted: false
          }
        })
      }
    }

    onMounted(() => {
      const eventChannel = getCurrentPages()[getCurrentPages().length - 1].getOpenerEventChannel()
      
      eventChannel.on('acceptRouteData', (route: RouteItem) => {
        adjustedRoutes.value = [adjustRoute(route)]
      })
    })

    return {
      adjustedRoutes,
      adjustmentNote,
      navigateToDetail
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
  margin-bottom: 20px;
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
  line-height: 1.5;
}

.adjusted-spot {
  color: #4a90e2;
  font-weight: 500;
}

.adjustment-note {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
}

.note-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.note-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>