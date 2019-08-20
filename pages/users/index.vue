<template>
	<section>
		<div class="buttons">
			<nuxt-link tag="button" to="/users/new" type="button" v-if="permissions.create" class="btn btn-primary d-flex justify-content-center align-content-between">
				<i class="material-icons mb-18">add</i> New User
			</nuxt-link>
		</div>
		<table class="table table-borderless">
			<thead>
				<tr>
					<td colspan="2">
						<div class="input-group search-input-group">
							<div class="input-group-prepend">
								<div class="input-group-text"><i class="material-icons mb-18">search</i></div>
							</div>
							<input type="text" class="form-control" v-model="filter.search" placeholder="Search by username or name">
						</div>
					</td>
					<td v-if="isAdmin">
						<div class="input-group select-input-group">
							<label>Dealer:</label>
							<select class="form-control" v-model="filter.dealer">
								<option value="">All</option>
								<option :value="dealer.name" v-for="dealer in dealers">{{ dealer.name }}</option>
							</select>
						</div>
					</td>
					<td>
						<div class="input-group select-input-group">
							<label>Role:</label>
							<select class="form-control" v-model="filter.role">
								<option value="">All</option>
								<option :value="role.name" v-for="role in roles">{{ role.name }}</option>
							</select>
						</div>
					</td>
					<td>
						<div class="input-group select-input-group">
							<label>Status:</label>
							<select class="form-control" v-model="filter.status">
								<option value="">All</option>
								<option value="true">Active</option>
								<option value="false">Inactive</option>
							</select>
						</div>
					</td>
					<td></td>
				</tr>
				<tr>
					<th scope="col">Name</th>
					<th scope="col">Username</th>
					<th scope="col" v-if="isAdmin">Dealership</th>
					<th scope="col">Role</th>
					<th scope="col">Status</th>
					<th scope="col">Last Login</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="!users.length">
					<td colspan="6"><p>No users to display, start adding roles using the + New User button at the top.</p></td>
				</tr>
				<tr v-for="user in users">
					<td v-if="permissions.edit"><nuxt-link :to="{ path: 'users/' + user._id }">{{ user.fullName }}</nuxt-link></td>
					<td v-if="!permissions.edit"><strong>{{ user.fullName }}</strong></td>
					<td>{{ user.userName }}</td>
					<td v-if="isAdmin">{{ user.dealershipName | dealer }}</td>
					<td>{{ user.roleName }}</td>
					<td>{{ user.status | status }}</td>
					<td>{{ user.lastLoginDate | lastLogin }}</td>
				</tr>
			</tbody>
		</table>
		<paginate
			v-if="pageCount > 1"
			:page-count="pageCount"
			:click-handler="getUsers"
			:container-class="'pagination'"
			:page-class="'page-class'"
			:page-link-class="'page-link'"
			:prev-class="'page-class'"
			:prev-link-class="'page-link'"
			:next-class="'page-class'"
			:next-link-class="'page-link'">
		</paginate>
	</section>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';

export default {
	created() {
		let can = this.loggedInUser.role.users;
		if(!can.view)
			return this.$router.push('/');
	},
	computed : {
		...mapGetters(['loggedInUser']),
		permissions(){
			return this.loggedInUser.role.users;
		},
		isAdmin(){
			return this.loggedInUser.role.roles.create;
		},
		pageCount(){
			return Math.ceil(this.totalRows / this.maxRows);
		}
	},
	mounted() {
		this.getDealers();
		this.getRoles();
	},
	asyncData({ $axios, error }){
		return $axios.$get('/users?page=1')
		.then((response) => {
			return {
				users : response.data,
				maxRows : response.max,
				totalRows : response.total
			}
		})
		.catch((err) => {
			error({ message: 'Error fetching users data' });
		});
	},
	data() {
		return {
			users : [],
			maxRows : 1,
			totalRows : 1,
			roles : [],
			dealers : [],
			filter : {
				search : '',
				dealer : '',
				role : '',
				status : ''
			}
		}
	},
	methods: {
		getRoles() {
			this.$axios.$get('/roles')
			.then((response) => {
				this.roles = response;
			})
			.catch((error) => {
				this.createAlert('warn', "Users", "Error fetching roles data");
			});
		},
		getDealers() {
			this.$axios.$get('/ikon/dealers')
			.then((response) => {
				this.dealers = response;
			})
			.catch((error) => {
				this.createAlert('warn', "Users", "Error fetching dealer data");
			});
		},
		getUsers(page) {
			let url = '/users?page=' + (page || 1);

			if(this.filter.search != "")
				url += '&name=' + this.filter.search;
			if(this.filter.dealer != "")
				url += '&dealer=' + this.filter.dealer;
			if(this.filter.role != "")
				url += '&role=' + this.filter.role;
			if(this.filter.status != "")
				url += '&status=' + this.filter.status;

			this.$axios.$get(url)
			.then((response) => {
				this.users = response.data;
				this.maxRows = response.max;
				this.totalRows = response.total;
			})
			.catch((error) => {
				this.createAlert('warn', "Users", "Error fetching users data");
			});
		}
	},
	watch : {
		"filter.search"(value) {
			this.getUsers();
		},
		"filter.dealer"(value) {
			this.getUsers();
		},
		"filter.role"(value) {
			this.getUsers();
		},
		"filter.status"(value) {
			this.getUsers();
		}
	},
	filters : {
		dealer(dealer){
			if(dealer == '')
				return "Default Dealer";
			return dealer;
		},
		status(status){
			if(status) return "Active";
			return "Inactive";
		},
		created(created){
			return moment(created).format('ll');
		},
		lastLogin(modified){
			if(modified)
				return moment(modified).format('ll');
			return "-";
		}
	}
}
</script>
