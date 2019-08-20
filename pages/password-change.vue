<template>
	<section>
		<div class="login-form row justify-content-center">
			<div class="main-div col-4">
				<div class="panel">
					<h1>Change Password</h1>
					<p>Please enter your old password and the new one.</p>
				</div>
				<form method="post" @submit.prevent="changePassword">
					<div class="form-group">
						<input type="password" class="form-control" v-model="oldPassword" placeholder="Old Password">
					</div>
					<div class="form-group">
						<input type="password" class="form-control" v-model="newPassword" placeholder="New Password">
					</div>
					<div class="form-group">
						<input type="password" class="form-control" v-model="confirmation" placeholder="Confirmation">
					</div>
					<button type="submit" class="btn btn-primary">Change Password</button>
				</form>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	data() {
		return {
			oldPassword: '',
			newPassword: '',
			confirmation: ''
		}
	},
	methods: {
		changePassword() {
			if(this.newPassword != this.confirmation)
				return this.createAlert('error', "Confirmation", "Confirmation doesn't match");
			let formData = {
				oldPassword: this.oldPassword,
				newPassword: this.newPassword,
				userId: this.$route.query.uid
			};
			this.$axios.$put('/reset', formData)
			.then((response) => {
				this.createAlert('success', "Password", "Your password has been updated.");
				this.$auth.logout();
				this.$router.push('/login');
			})
			.catch((error) => {
				this.createAlert('error', "Error updating credentials", error);
			});
		}
	}
}
</script>
