<template>
	<section>
		<div class="buttons">
			<nuxt-link tag="button" to="/roles/new" type="button" v-if="permissions.create" class="btn btn-primary d-flex justify-content-center align-content-between">
				<i class="material-icons mb-18">add</i> New Role
			</nuxt-link>
		</div>
		<table class="table table-borderless">
			<thead>
				<tr>
					<td>
						<div class="input-group search-input-group">
							<div class="input-group-prepend">
								<div class="input-group-text"><i class="material-icons mb-18">search</i></div>
							</div>
							<input type="text" class="form-control" v-model="filter.search" placeholder="Search by role name">
						</div>
					</td>
				</tr>
				<tr>
					<th scope="col">Role Name</th>
					<th scope="col">Created</th>
					<th scope="col">Modified</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="!roles.length">
					<td colspan="3"><p>No roles to display, start adding roles using the + New Role button at the top.</p></td>
				</tr>
				<tr v-for="r in roles">
					<td v-if="permissions.edit"><nuxt-link :to="{ path: 'roles/' + r._id }">{{r.name}}</nuxt-link></td>
					<td v-if="!permissions.edit"><strong>{{r.name}}</strong></td>
					<td>{{ r.createdDate | created }}</td>
					<td>{{ r.modifiedDate | modified }}</td>
				</tr>
			</tbody>
		</table>
		<paginate
			v-if="pageCount > 1"
			:page-count="pageCount"
			:click-handler="getRoles"
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
		let can = this.loggedInUser.role.roles;
		if(!can.view)
			return this.$router.push('/');
	},
	computed : {
		...mapGetters(['loggedInUser']),
		permissions(){
			return this.loggedInUser.role.roles;
		},
		pageCount(){
			return Math.ceil(this.totalRows / this.maxRows);
		}
	},
	asyncData({ $axios, error }){
		return $axios.$get('/roles?page=1')
		.then((response) => {
			return {
				roles : response.data,
				maxRows : response.max,
				totalRows : response.total
			}
		})
		.catch((err) => {
			error({ message: 'Error fetching roles data' });
		});
	},
	data() {
		return {
			roles : [],
			maxRows : 1,
			totalRows : 1,
			filter : {
				search : ''
			}
		}
	},
	methods: {
		getRoles(page) {
			let url = '/roles?page=' + (page || 1);

			if(this.filter.search != "")
				url += '&name=' + this.filter.search;
			if(this.filter.dealer != "")
				url += '&dealer=' + this.filter.dealer;

			this.$axios.$get(url)
			.then((response) => {
				this.roles = response.data;
				this.maxRows = response.max;
				this.totalRows = response.total;
			})
			.catch((error) => {
				this.createAlert('error', "Roles", "Error fetching roles data");
			});
		}
	},
	watch : {
		"filter.search"(value) {
			this.getRoles();
		}
	},
	filters : {
		created(created){
			return moment(created).format('YYYY-MM-DD HH:mm');
		},
		modified(modified){
			if(modified)
				return moment(modified).format('YYYY-MM-DD HH:mm');
			return "-";
		}
	}
}
</script>
