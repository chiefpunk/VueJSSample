<template>
	<section id="user" class="wrapper container">
		<b-alert variant="danger" show dismissible fade v-if="error">{{error}}</b-alert>
		<h1>User Details</h1>
		<div class="row">
			<div class="col-8">
				<form class="form">
					<div class="row">
						<div class="col-6">
							<div class="form-group">
								<label class="h4" for="u-fullname">Full Name</label> <!--a href="javascript:;"><i class="material-icons form-icon">&#xe8fd;</i></a-->
								<input type="text" id="u-fullname" v-model="post.fullName" class="form-control" aria-describedby="u-fullname-help" placeholder="First and last name." maxlength="80" autocomplete="new-password">
							</div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label class="h4" for="u-email">Email</label> <!--a href="javascript:;"><i class="material-icons form-icon">&#xe8fd;</i></a-->
								<input type="text" id="u-email" v-model="post.email" class="form-control" aria-describedby="u-email-help" placeholder="Enter a valid email address." maxlength="80" autocomplete="new-password">
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<div class="form-group">
								<label class="h4" for="u-role">Asigned Role</label> <!--a href="javascript:;"><i class="material-icons form-icon">&#xe8fd;</i></a-->
								<select class="form-input custom-select" id="u-role" v-model="post.roleId">
									<option value="">Select a role</option>
									<option :value="role._id" v-for="role in roles">
										{{ role.name }}
									</option>
								</select>
							</div>
						</div>
						<div class="col-6">
							<div class="form-group">
								<label class="h4" for="u-role">Status</label> <!--a href="javascript:;"><i class="material-icons form-icon">&#xe8fd;</i></a-->
								<div class="form-check">
									<input class="form-check-input" type="radio" name="u-status" id="u-inactive" v-model="post.status" value="false">
									<label class="form-check-label" for="u-inactive">
										Inactive
									</label>
								</div>
								<div class="form-check">
									<input class="form-check-input" type="radio" name="u-status" id="u-active" v-model="post.status" value="true">
									<label class="form-check-label" for="u-active">
										Active
									</label>
								</div>
							</div>
						</div>
					</div>
					<div class="row" v-if="isSuperAdmin">
						<div class="col-6">
							<div class="form-group">
								<label class="h4" for="u-dealer">Dealer</label> <!--a href="javascript:;"><i class="material-icons form-icon">&#xe8fd;</i></a-->
								<select class="form-input custom-select" id="u-dealer" v-model="post.dealershipId" v-on:change="getDealerName">
									<option value="">Select a dealer</option>
									<option value="0" data-name="" v-if="permissions.admin">All Dealers</option>
									<option :value="dealer.id" :data-name="dealer.name" :data-url="dealer.url" v-for="dealer in dealers">
										{{ dealer.name }}
									</option>
								</select>
							</div>
						</div>
						<div class="col-6">
						</div>
					</div>
					<div class="row">
						<div class="col-4">
							<label class="h4" for="u-username">Username</label>
						</div>
						<div class="col-4">
							<label class="h4" for="u-password">Password</label>
						</div>
						<div class="col-4">
							<label class="h4" for="u-confirm">Confirm Password</label>
						</div>
					</div>
					<div class="row">
						<div class="col-4">
							<input type="text" id="u-username" v-model="post.userName" class="form-control" aria-describedby="u-username-help" placeholder="4 to 30 characters." maxlength="30" autocomplete="new-password" />
						</div>
						<div class="col-4">
							<input type="password" id="u-password" v-model="post.password" class="form-control" aria-describedby="u-password-help" placeholder="4 to 20 characters." maxlength="20" autocomplete="new-password" />
						</div>
						<div class="col-4">
							<input type="password" id="u-confirm" v-model="confirmation" class="form-control" aria-describedby="u-confirm-help" placeholder="4 to 20 characters." maxlength="20" autocomplete="new-password" />
						</div>
					</div>
					<div class="buttons">
						<button class="btn btn-primary" type="button" v-if="!this.id && permissions.create" v-on:click="sendForm">Save</button>
						<button class="btn btn-primary" type="button" v-if="this.id && permissions.edit" v-on:click="updateUser">Update</button>
						<button class="btn btn-outline-dark" style="margin-left: 15px;" type="button" v-on:click="cancel">Cancel</button>
						<button class="btn btn-outline-dark float-right" v-if="this.id && permissions.delete" type="button" v-on:click="deleteUser">Delete</button>
					</div>
				</form>
			</div>
		</div>
	</section>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	created() {
		let can = this.loggedInUser.role.users;
		if(!can.create && !can.edit && !!can.delete)
			return this.$router.push('/users');
	},
	computed : {
		...mapGetters(['loggedInUser', 'isAdmin', 'isSuperAdmin']),
		permissions(){
			return this.loggedInUser.role.users;
		}
	},
	mounted() {
		if(this.$route.params.id == 'undefined')
			true;// FIXME alert error
		if(this.$route.params.id != 'new'){
			this.id = this.$route.params.id;
			this.getUser();
		}
		this.getRoles();
		this.getDealers();

	},
	data() {
		return {
			id : null,
			error : null,
			confirmation : '',
			roles : [],
			dealers : [],
			post : {
				fullName : '',
				email : '',
				roleId : '',
				dealershipId : '',
				dealershipName : '',
				dealershipUrl : '',
				userName : '',
				password : '',
				status : true
			}
		}
	},
	methods : {
		getDealerName(e){
			if(e.target.options.selectedIndex > -1) {
            	this.post.dealershipName = e.target.options[e.target.options.selectedIndex].dataset.name;
				this.post.dealershipUrl = e.target.options[e.target.options.selectedIndex].dataset.url;
        	}
		},
		getUser(){
			this.$axios.$get('/users/' + this.id)
			.then((response) => {
				this.post.fullName = response.fullName;
				this.post.email = response.email;
				this.post.roleId = response.roleId;
				this.post.dealershipId = response.dealershipId == 'fortytwo' ? '0' : response.dealershipId;
				this.post.dealershipName = response.dealershipName;
				this.post.dealershipUrl = response.dealershipUrl;
				this.post.userName = response.userName;
				this.post.status = response.status;
			})
			.catch((error) => {
				this.createAlert('error', "Error fetching user data", error);
			});
		},
		getRoles() {
			let userRole = this.loggedInUser.role.users;
			let path = '/roles';
			if(!userRole.admin){
				path = '/roles?admin=false';
			}
			this.$axios.$get(path)
			.then((response) => {
				this.roles = response;
			})
			.catch((error) => {
				this.createAlert('warn', "Error fetching roles data", error);
			});
		},
		getDealers() {
			this.$axios.$get('/ikon/dealers')
			.then((response) => {
				this.dealers = response;
			})
			.catch((error) => {
				this.createAlert('warn', "Error fetching dealers data", error);
			});
		},
		sendForm() {
			this.validateForm(true)
			.then(() => {
				let formData = this.post;
				if(formData.password != this.confirmation){
					this.createAlert('warn', "Validation", "Password and confirmation do not match.");
					return false;
				}
				if(formData.dealershipId == '0')
					formData.dealershipId = 'fortytwo';
				formData.status = ((formData.status == "true" || formData.status == true) ? true : false);
				this.$axios.$post('/users', formData)
				.then((response) => {
					this.createAlert('success', "Create", "User created successfully");
					this.$router.push('/users');
				})
				.catch((error) => {
					this.createAlert('error', "Error creating user", error);
				});
			})
			.catch((err) => {
				console.warn("Invalid form.", err);
			});
		},
		updateUser(){
			this.validateForm(false)
			.then(() => {
				let formData = this.post;
				if(this.post.password == '' && this.confirmation == '')
					delete formData.password;
				formData.status = ((formData.status == "true" || formData.status == true) ? true : false);
				this.$axios.$put('/users/' + this.id, formData)
				.then((response) => {
					this.createAlert('success', "Update", "User updated successfully");
					this.$router.push('/users');
				})
				.catch((error) => {
					this.createAlert('error', "Error updating user", error);
				});
			})
			.catch(() => {
				console.warn("Invalid form.");
			});
		},
		deleteUser(){
			this.$axios.$delete('/users/' + this.id)
			.then((response) => {
				this.createAlert('success', "Delete", "User deleted successfully");
				this.$router.push('/users');
			})
			.catch((error) => {
				this.createAlert('error', "Error deleting user", error);
			});
		},
		cancel(){
			this.$router.push('/users');
		},
		validateForm(create){
			return new Promise((resolve, reject) => {
				if(this.post.fullName == ''){
					this.createAlert('error', "Validation", "Full Name can not be empty.");
					return reject();
				}
				let regular =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				if(!regular.test(this.post.email)){
					this.createAlert('error', "Validation", "Enter a valid Email.");
					return reject();
				}
				if(!this.post.roleId){
					this.createAlert('error', "Validation", "Please select a Role for this user.");
					return reject();
				}
				if(this.isSuperAdmin && !this.post.dealershipId && !this.post.dealershipName){
					this.createAlert('error', "Validation", "Please select a Dealer for this user.");
					return reject();
				}
				if(this.post.userName.length < 4 || this.post.userName.length > 30 ){
					this.createAlert('error', "Validation", "Username must have a minimum of 4 characters and a maximum of 30 characters.");
					return reject();
				}
				if(create == true){
					if(this.post.password.length < 4 || this.post.password.length > 20 ){
						this.createAlert('error', "Validation", "Password must have a minimum of 4 characters and a maximum of 20 characters.");
						return reject();
					}
				}

				resolve();
			});
		}
	}
}
</script>

<style>
input[type=radio]{ transform:scale(1.2);}
</style>
