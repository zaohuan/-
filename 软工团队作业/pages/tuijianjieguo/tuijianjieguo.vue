<!-- PTR-FR-002 -->
<template>
  <view class="container">
    <!-- 推荐路线列表 -->
    <view class="route-list">
      <view class="route-card" 
            v-for="(route, index) in recommendRoutes" 
            :key="index"
            @click="navigateToDetail(route)">
        <view class="route-title">{{ route.title }}</view>
        <view class="route-path">
          <template v-for="(spot, spotIndex) in route.spots" :key="spotIndex">
            <text>{{ spot.name }}</text>
            <text v-if="spotIndex !== route.spots.length - 1"> → </text>
          </template>
        </view>
        <view class="route-budget">预算：{{ route.budget }}元/人</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

// 统一的数据接口
interface SpotItem {
  name: string
  isAdjusted?: boolean  // 可选,用于标记调整后的景点
}

interface RouteItem {
  title: string        // 路线标题
  spots: SpotItem[]    // 景点数组
  budget: string      // 可选,用于推荐结果页显示预算
}

export default defineComponent({
  setup() {
    // 初始化为空数组，实际数据会在 generateRecommendations 中设置
    const recommendRoutes = ref<RouteItem[]>([])

    const navigateToDetail = (route: RouteItem) => {
      uni.navigateTo({
        url: '/pages/route-detail/route-detail',
        success: (res) => {
          res.eventChannel.emit('acceptRouteData', route)
        }
      })
    }

    // 获取推荐路线
    const generateRecommendations = (formData: any) => {
          // 获取accessToken
          uniCloud.callFunction({
            name: 'getAccessToken',  // 调用获取accessToken的云函数
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
                name: 'getTuiJianJieGuo',
                data: {
                  accessToken: accessToken,
                  formData: formData,  // 传递用户的表单数据
                  modelurl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro'  // 替换为实际的API URL
                },
                success: (res) => {
                  if (res.result) {
                    recommendRoutes.value = res.result.data.routes || [];
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
          });
        }

    onMounted(() => {
      // 获取当前页面栈
      const pages = getCurrentPages()
	  
      // 获取当前页面对象
      const currentPage = pages[pages.length - 1]

      // 获取事件通道
      const eventChannel = currentPage.getOpenerEventChannel()
      
      // 监听acceptFormData事件
      eventChannel.on('acceptFormData', (data) => {
        console.log('接收到的表单数据：', JSON.stringify(data))
        generateRecommendations(data)
      })
    })

    return {
      recommendRoutes,
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

.route-budget {
  font-size: 14px;
  color: #666;
}
</style> 
