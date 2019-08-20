<template>
	<section>
		<div class="login-form row justify-content-center">
			<div class="main-div col-4">
				<div class="panel">
					<h1>Forgot Password</h1>
					<p>Please enter your username and email</p>
				</div>
				<form method="post" @submit.prevent="getPassword">
					<div class="form-group">
						<input type="text" class="form-control" v-model="userName" placeholder="Username">
					</div>
					<div class="form-group">
						<input type="email" class="form-control" v-model="email" placeholder="Email">
					</div>
					<button type="submit" class="btn btn-primary">Send New Password</button>
				</form>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	auth: false,
	data() {
		return {
			userName: '',
			email: ''
		}
	},
	methods: {
		getPassword() {
			this.validateForm()
			.then(() => {
				let formData = {
					userName: this.userName,
					email: this.email
				};
				this.$axios.$post('/users/forgot', formData)
				.then((response) => {
					this.createAlert('success', "Password", "Please check your email to get your credentials");
					this.$router.push('/login');
				})
				.catch((error) => {
					this.createAlert('error', "Can not Send New Password", error);
				});
			})
			.catch(() => {
				console.warn("Invalid form.");
			});
		},
		validateForm(){
			return new Promise((resolve, reject) => {
				if(this.userName == ''){
					this.createAlert('error', "Can not Send New Password", "Username can not be empty.");
					return reject();
				}
				if(this.email == ''){
					this.createAlert('error', "Can not Send New Password", "Email can not be empty.");
					return reject();
				}
				let regular =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				if(!regular.test(this.email)){
					this.createAlert('error', "Can not Send New Password", "Enter a valid Email.");
					return reject();
				}
				resolve();
			});
		}

	}
}
</script>

<style>
</style>
