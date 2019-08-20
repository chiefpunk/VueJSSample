<template>
	<section id="roles" class="wrapper container">
		<b-alert variant="danger" show dismissible fade v-if="error">{{error}}</b-alert>
		<h1>Role Management</h1>
		<p>Use this section to select capabilities which will be granted to each role.</p>
		<div class="row">
			<div class="col-8">
				<form class="form">
					<div class="row">
						<div class="col-6">
							<div class="form-group">
								<label class="h4" for="r-name">Role Name</label> <!--a href="javascript:;"><i class="material-icons form-icon">&#xe8fd;</i></a-->
								<input type="text" id="r-name" v-model="post.name" class="form-control" aria-describedby="r-name-help" placeholder="40 characters or less." maxlength="40" required>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<h4>Feature</h4>
						</div>
						<div class="col-6">
							<h4>Permission</h4>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<label>Campaigns</label>
						</div>
						<div class="col-6">
							<div class="row justify-content-start">
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="cp-view" value="true" v-model="post.campaigns.view" :disabled="disabled.campaigns">
									<label class="form-check-label" for="cp-view">view</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="cp-create" value="true" v-model="post.campaigns.create">
									<label class="form-check-label" for="cp-create">create</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="cp-edit" value="true" v-model="post.campaigns.edit">
									<label class="form-check-label" for="cp-edit">edit</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="cp-delete" value="true" v-model="post.campaigns.delete">
									<label class="form-check-label" for="cp-delete">delete</label>
								</div>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<label>Reports</label>
						</div>
						<div class="col-6">
							<div class="row justify-content-start">
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="rp-view" value="true" v-model="post.reports.view">
									<label class="form-check-label" for="rp-view">view</label>
								</div>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<label>Users</label>
						</div>
						<div class="col-6">
							<div class="row justify-content-start">
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="us-view" value="true" v-model="post.users.view" :disabled="disabled.users">
									<label class="form-check-label" for="us-view">view</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="us-create" value="true" v-model="post.users.create">
									<label class="form-check-label" for="us-create">create</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="us-edit" value="true" v-model="post.users.edit">
									<label class="form-check-label" for="us-edit">edit</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="us-admin" value="true" v-model="post.users.admin">
									<label class="form-check-label" for="us-admin">admin</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="us-delete" value="true" v-model="post.users.delete">
									<label class="form-check-label" for="us-delete">delete</label>
								</div>
							</div>
						</div>
					</div>
					<div class="row" v-if="isAdmin || isSuperAdmin">
						<div class="col-6">
							<label>Roles</label>
						</div>
						<div class="col-6">
							<div class="row justify-content-start">
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="ro-view" value="true" v-model="post.roles.view" :disabled="disabled.roles">
									<label class="form-check-label" for="ro-view">view</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="ro-create" value="true" v-model="post.roles.create">
									<label class="form-check-label" for="ro-create">create</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="ro-edit" value="true" v-model="post.roles.edit">
									<label class="form-check-label" for="ro-edit">edit</label>
								</div>
								<div class="col-2 text-center">
									<input class="form-check-input" type="checkbox" id="ro-delete" value="true" v-model="post.roles.delete">
									<label class="form-check-label" for="ro-delete">delete</label>
								</div>
							</div>
						</div>
					</div>
					<div class="buttons">
						<button class="btn btn-primary" type="button" v-if="!this.id && permissions.create" v-on:click="sendForm">Save</button>
						<button class="btn btn-primary" type="button" v-if="this.id && permissions.edit" v-on:click="updateRole">Update</button>
						<button class="btn btn-outline-dark" style="margin-left: 15px;" type="button" v-on:click="cancel">Cancel</button>
						<button class="btn btn-outline-dark float-right" v-if="this.id && permissions.delete" type="button" v-on:click="deleteRole">Delete</button>
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
		let can = this.loggedInUser.role.roles;
		if(!can.create && !can.edit && !can.delete)
			return this.$router.push('/roles');
	},
	computed : {
		...mapGetters(['loggedInUser', 'isAdmin', 'isSuperAdmin']),
		permissions(){
			return this.loggedInUser.role.roles;
		}
	},
	mounted() {
		if(this.$route.params.id == 'undefined')
			true;// FIXME alert error
		if(this.$route.params.id != 'new'){
			this.id = this.$route.params.id;
			this.getRole();
		}
	},
	data() {
		return {
			id: null,
			error: null,
			disabled: {
				campaigns : false,
				users : false,
				roles : false
			},
			post: {
				name: '',
				campaigns: {
		            view: false,
		            create: false,
		            edit: false,
		            delete: false
		        },
		        reports: {
		            view: false
		        },
		        users: {
		            view: false,
		            create: false,
		            edit: false,
		            admin: false,
		            delete: false
		        },
		        roles: {
		            view: false,
		            create: false,
		            edit: false,
		            delete: false
		        }
			}
		}
	},
	methods: {
		getRole(){
			this.$axios.$get('/roles/' + this.id)
			.then((response) => {
				this.post.name = response.name;
				this.post.campaigns = response.campaigns;
				this.post.reports = response.reports;
				this.post.users = response.users;
				this.post.roles = response.roles;
			})
			.catch((error) => {
				this.createAlert('error', "Error getting role data", error);
			});
		},
		sendForm(){
			if(this.post.name.length < 1 || this.post.name.length > 40){
				return this.createAlert('error', "Validation", "Role Name must be between 1 and 40 characters");
			}
			let formData = this.post;
			formData.status = formData.status == 'true' ? true : false;
			this.$axios.$post('/roles', formData)
			.then((response) => {
				this.createAlert('success', "Create", "Role created successfully");
				this.$router.push('/roles');
			})
			.catch((error) => {
				this.createAlert('error', "Error creating role", error);
			});
		},
		updateRole(){
			let formData = this.post;
			this.$axios.$put('/roles/' + this.id, formData)
			.then((response) => {
				this.createAlert('success', "Update", "Role updated successfully");
				this.$router.push('/roles');
			})
			.catch((error) => {
				this.createAlert('error', "Error updating role", error);
			});
		},
		deleteRole(){
			this.$axios.$delete('/roles/' + this.id)
			.then((response) => {
				this.createAlert('success', "Delete", "Role deleted successfully");
				this.$router.push('/roles');
			})
			.catch((error) => {
				this.createAlert('error', "Error deleting role", error);
			});
		},
		cancel(){
			this.$router.push('/roles');
		}
	},
	watch : {
		"post.campaigns": {
			handler(data){
		       if(data.create || data.edit || data.delete){
				   data.view = true;
				   this.disabled.campaigns = true;
			   }
			   else this.disabled.campaigns = false;
		    },
			deep: true
		},
		"post.users": {
			handler(data){
		       if(data.create || data.edit || data.admin || data.delete){
				   data.view = true;
				   this.disabled.users = true;
			   }
			   else this.disabled.users = false;
		    },
			deep: true
		},
		"post.roles": {
			handler(data){
		       if(data.create || data.edit || data.delete){
				   data.view = true;
				   this.disabled.roles = true;
			   }
			   else this.disabled.roles = false;
		    },
			deep: true
		}
	}
}
</script>
<style>
#roles input.form-check-input{display: inline-block; position: relative; margin: 0;}
#roles label.form-check-label{display: block;}
</style>
