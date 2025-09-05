<script>
	import CONFIG from '@/common/config/index.js'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			const env = CONFIG.APP_ENV
			console.log(
				`%c ${CONFIG.APP_NAME} %c v${CONFIG.APP_VERSION} %c ${env}`,
				"background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
				"background:#007aff ;padding: 1px; color: #fff; font-weight: bold;",
				`background: ${ env === 'development' ? '#dd524d' : '#4cd964' };padding: 1px 6px 1px 1px; border-radius: 0 3px 3px 0;  color: #fff; font-weight: bold;`
			);
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
</style>