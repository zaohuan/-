<template>
	<view class="my-trips">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="back-icon" @click="goBack">
				<image src="/static/icons/back.png" mode="widthFix"></image>
			</view>
			<text class="title">我的行程</text>
		</view>

		<!-- 行程列表 -->
		<view class="trip-list">
			<view class="trip-item" v-for="(trip, index) in tripList" :key="index" @click="goToTripDetail(trip)">
				<view class="trip-header">
					<text class="city">{{trip.city}}</text>
					<text class="day">第{{trip.day}}天</text>
				</view>
				<view class="trip-route">
					<text>{{trip.route}}</text>
				</view>
				<view class="trip-budget">
					<text>预算：{{trip.budget}}元/人</text>
				</view>
				<view class="trip-actions">
					<view class="action-btn real-time" @click.stop="realTimeAdjust(trip)">
						<text>实时调整</text>
					</view>
					<view class="action-btn manual" @click.stop="manualModify(trip)">
						<text>手动修改</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tripList: [
					{
						id: 1,
						city: '福州',
						day: 1,
						route: '鼓山 → 三坊七巷 → 达明美食街',
						budget: '1460-2780'
					}
					// 可以添加更多行程数据
				]
			}
		},
		methods: {
			goBack() {
				uni.switchTab({
					url: '/pages/shouye/shouye'
				})
			},
			goToTripDetail(trip) {
				uni.navigateTo({
					url: `/pages/trip-detail/trip-detail?id=${trip.id}`
				})
			},
			realTimeAdjust(trip) {
				uni.navigateTo({
					url: `/pages/real-time-adjust/real-time-adjust?id=${trip.id}`
				})
			},
			manualModify(trip) {
				uni.navigateTo({
					url: `/pages/manual-modify/manual-modify?id=${trip.id}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.my-trips {
	min-height: 100vh;
	background-color: #f5f5f5;

	.header {
		background-color: #1890ff;
		padding: 40rpx 20rpx;
		display: flex;
		align-items: center;
		color: #fff;
		
		.back-icon {
			width: 40rpx;
			height: 40rpx;
			margin-right: 20rpx;
			
			image {
				width: 100%;
				height: 100%;
			}
		}
		
		.title {
			font-size: 32rpx;
			font-weight: 500;
		}
	}

	.trip-list {
		padding: 20rpx;
		
		.trip-item {
			background-color: #fff;
			border-radius: 12rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			
			.trip-header {
				display: flex;
				justify-content: space-between;
				margin-bottom: 10rpx;
				
				.city {
					font-size: 32rpx;
					color: #333;
					font-weight: 500;
				}
				
				.day {
					font-size: 28rpx;
					color: #666;
				}
			}
			
			.trip-route {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 10rpx;
			}
			
			.trip-budget {
				font-size: 26rpx;
				color: #666;
			}
			
			.trip-actions {
				display: flex;
				justify-content: flex-end;
				margin-top: 20rpx;
				gap: 20rpx;
				
				.action-btn {
					padding: 10rpx 30rpx;
					border-radius: 30rpx;
					font-size: 24rpx;
					
					&.real-time {
						background-color: #1890ff;
						color: #fff;
					}
					
					&.manual {
						background-color: #f0f0f0;
						color: #666;
					}
				}
			}
		}
	}
}
</style>
