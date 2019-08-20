<template>
	<section>
		<div class="login-form row justify-content-center">
			<div class="main-div col-4">
				<div class="panel">
					<h1>Login</h1>
					<p>Enter Username (case sensitive) and Password</p>
				</div>
				<form method="post" @submit.prevent="login">
					<div class="form-group">
						<input type="text" class="form-control" v-model="userName" placeholder="Username">
					</div>
					<div class="form-group">
						<input type="password" class="form-control" v-model="password" placeholder="Password">
					</div>
					<div class="form-group">
						<p class="text-right"><nuxt-link to="/password-forgot" style="font-weight:100;">Forgot password?</nuxt-link></p>
					</div>
					<button type="submit" class="btn btn-primary">Login</button>
				</form>
			</div>
		</div>
	</section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	computed: {
		...mapGetters(['loggedInUser']),
	},
	data() {
		return {
			userName: '',
			password: '',
			error: null
		}
	},
	methods: {
		async login() {
			try {
				await this.$auth.loginWith('local', {
					data: {
						userName: this.userName,
						password: this.password
					}
				});
				if(this.loggedInUser.isForgot){
					this.createAlert('warn', "Generated Password", "You need to change your password in order to continue.");
					this.$router.push('/password-change');
					return false;
				}
				this.$router.push('/');
			} catch (e){
				this.createAlert('error', "Login", e);
			}
		}
	}
}
</script>
