<template>
	<div>
		<header>
			<div class="wrapper">
				<img class="logo" src="/images/ikongps-logo.png" height="50" alt="IkonGPS" />
				<ul class="nav justify-content-center" v-if="isAuthenticated">
					<nuxt-link tag="li" exact to="/campaigns" class="nav-item" v-if="!changePass && permissions.campaigns.view">
						<a class="nav-link">Campaigns</a>
					</nuxt-link>
					<li class="nav-item dropdown" id="nav-reports" v-if="!changePass && permissions.reports.view">
						<a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Reports</a>
						<div class="dropdown-menu">
							<nuxt-link exact to="/reports/activity" class="dropdown-item">Activity</nuxt-link>
							<nuxt-link exact to="/reports/delivery" class="dropdown-item">Delivery</nuxt-link>
						</div>
					</li>
					<nuxt-link tag="li" exact to="/users" class="nav-item" v-if="!changePass && permissions.users.view">
						<a class="nav-link">Users</a>
					</nuxt-link>
					<nuxt-link tag="li" exact to="/roles" class="nav-item" v-if="!changePass && permissions.roles.view">
						<a class="nav-link">Administrator</a>
					</nuxt-link>
				</ul>
				<div class="logout" v-if="isAuthenticated">
					<a href="javascript:;" @click="logout"><img src="/images/log_out_icon.png" />&nbsp;Log&nbsp;out</a>
					<div class="name">{{ loggedInFullName }}</div>
				</div>
			</div>
		</header>
		<v-dialog/>
		<notifications group="alerts" position="top left" style="width: 40%; left: 30%;" />
		<main class="wrapper">
			<nuxt />
		</main>
		<footer>
			<div class="wrapper">
				<ul class="nav justify-content-center">
					<li class="nav-item">
						<a class="nav-link disabled" href="#">Copyright&nbsp;©{{ new Date().getFullYear() }}</a>
					</li>
					<li class="nav-item">
<!--						<a class="nav-link" target="_blank" :href="apiBase + '/privacy-policy.pdf'">Privacy&nbsp;Notice</a>-->
					</li>
					<li class="nav-item">
<!--						<a class="nav-link" target="_blank" :href="apiBase + '/terms-conditions.pdf'">Terms</a>-->
					</li>
				</ul>
			</div>
		</footer>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
	computed: {
		...mapGetters(['isAuthenticated', 'loggedInUser']),
		permissions(){
			try{
				return this.loggedInUser.role;
			}catch(error){
				return false;
			}
		},
		changePass(){
			return this.loggedInUser.isForgot
		},
		apiBase(){
			return this.$axios.defaults.baseURL;
		},
		loggedInFullName(){
			return this.loggedInUser.fullName;
		}
	},
	methods: {
		async logout() {
			await this.$auth.logout();
			this.$router.push('/login');
		}
	},
	watch :{
    	$route (to, from){
			if(to.name == 'reports-activity' || to.name == 'reports-delivery')
				$('#nav-reports').addClass('nuxt-link-active');
			else
				$('#nav-reports').removeClass('nuxt-link-active');
    	}
	}
}
</script>
<style>
@font-face { font-family: 'Eurostile Bold'; src: url('/fonts/eurostile-bold.woff2') format('woff2'), url('/fonts/eurostile-bold.woff') format('woff'); font-weight: normal; font-style: normal; }
@font-face { font-family: 'Eurostile'; src: url('/fonts/eurostile.woff2') format('woff2'), url('/fonts/eurostile.woff') format('woff'); font-weight: normal; font-style: normal; }
html{ height: 100%; }
body{ font-family: "Roboto"; min-height: 100%; }
h1, h2, h3, .h1, .h2, .h3{ font-family: "Eurostile", sans-serif; }
h1{ font-size: 2em; margin: 20px 0;}
.wrapper{ width: 1200px; max-width:1200px; margin: 0 auto; position: relative; }
header{ height: 70px; background: #161616; }
header img.logo{ max-height:50px; position:absolute; top: 10px; }
header .nav a.nav-link{ color: #B3B3B3; font-family: "Eurostile", sans-serif; font-size: 1.5em; padding: 15px 50px 15px 50px; font-weight: 300; }
header .nav li.nuxt-link-active{ background: transparent url('/images/nav-line.png') center -15px no-repeat; }
header .nav li.nuxt-link-active a{ color: #7BE52F; }
header .nav .dropdown-menu a{ color: #161616 !important; }
header .logout{ position: absolute; right: 0; top: 15px; }
header .logout img{ display: inline; margin-bottom: 4px; }
header .logout a{ color: #B3B3B3; font-size: 1.2em; font-family: "Eurostile", sans-serif; line-height: 0.8em; }
header .name { color: #B3B3B3; font-size: 0.8em; padding: 0 0 0 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
section{ min-height: 100%; padding-bottom: 50px; }
button{ font-family: "Roboto", sans-serif;}
footer{ height: 25px; background: #161616; position: fixed; bottom: 0; width: 100%;}
footer a.nav-link{ padding: 0 10px; }
footer .nav .nav-item{ color: #B3B3B3; font-family: "Eurostile", sans-serif; font-size: 1em; font-weight: 300; }
footer .nav a.nav-link{ color: #B3B3B3; font-family: "Eurostile", sans-serif; text-decoration: underline; }
footer .nav a.disabled{ text-decoration: none; }

div.alert{margin: 10px 0;}
.btn-primary, .btn-primary:hover, .btn-primary:active{ background: #7BE52F !important; border-color: #7BE52F !important; color: #161616; font-weight: bold;}
.btn-outline-primary{ border-color: #7BE52F; color: #161616; font-weight: bold;}
.btn-outline-primary:hover, .btn-outline-primary:active{ background: #7BE52F !important; border-color: #7BE52F !important; }
.buttons{margin: 30px 0;}
.search-input-group{ }
.search-input-group .input-group-text{ background: transparent; border: none; border-radius: 0; border-bottom: solid #7BE52F 2px; padding-right: 0;}
.search-input-group .form-control{ background: transparent; border: none; border-radius: 0; border-bottom: solid #7BE52F 2px; }
.search-input-group .form-control:focus { border-color: none; box-shadow: none; }
.select-input-group{ width: 100%; }
.select-input-group label{ border-color: none; box-shadow: none; border-radius: 0; border-bottom: solid #7BE52F 2px; margin: 0; line-height: 2.2em; padding-right: 10px;}
.select-input-group select.form-control{ border: none; border-radius: 0; border-bottom: solid #7BE52F 2px; box-shadow: none; background: transparent url('/images/select_icon.png') right no-repeat; -webkit-appearance: none;
-moz-appearance: none; padding: 0; }
.form-label{ font-weight: bold; font-size: 1.1em;}
.form label.form-check-label{ font-weight: normal; }
.form-icon{ color: #B3B3B3; font-size: 1em; }
option{ font-family: "Roboto", sans-serif; }
.vue-dialog{background-color: #161616 !important; color: #f1f1f1; }
.dialog-c-title{color: #B3B3B3; }
.vue-notification { font-size: 1em !important; }
ul.pagination li.active a{background: #333 !important}
</style>
