<template>
	<section>
		<div class="buttons">
			<nuxt-link tag="button" to="/campaigns/new" type="button" v-if="permissions.create && !isSuperAdmin" class="btn btn-primary d-flex justify-content-center align-content-between">
				<i class="material-icons mb-18">add</i> New Campaign
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
							<input type="text" class="form-control" placeholder="Search by campaign" v-model="filter.search">
						</div>
					</td>
					<td v-if="isAdmin">
						<div class="input-group select-input-group">
							<label>Dealership:</label>
							<select class="form-control" v-model="filter.dealer">
								<option value="">All</option>
								<option :value="dealer.name" v-for="dealer in dealers">{{dealer.name}}</option>
							</select>
						</div>
					</td>
					<td>
						<div class="input-group select-input-group">
							<label>Frequency:</label>
							<select class="form-control" v-model="filter.frequency">
								<option value="">All</option>
								<option value="send-once">Send Once</option>
								<option value="ongoing">Ongoing</option>
							</select>
						</div>
					</td>
					<td>
						<div class="input-group select-input-group">
							<label>Status:</label>
							<select class="form-control" v-model="filter.status">
								<option value="">All</option>
								<option value="sent">Sent</option>
								<option value="stopped">Stopped</option>
								<option value="sending">Sending</option>
								<option value="scheduled">Scheduled</option>
							</select>
						</div>
					</td>
					<td></td>
				</tr>
				<tr>
					<th scope="col">Campaign</th>
					<th scope="col" v-if="isAdmin">Dealer</th>
					<th scope="col">Frequency</th>
					<th scope="col">Status</th>
					<th scope="col">Messages</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="!campaigns.length">
					<td colspan="6"><p>No campaigns to display, start adding campaigns using the + New Campaign button at the top.</p></td>
				</tr>
				<tr v-for="c in campaigns">
					<td v-if="!isAdmin && permissions.edit">
						<nuxt-link :to="{path: 'campaigns/' + c._id }">{{c.name}}</nuxt-link>
						<br/>
						<br/>
						<pre>{{ c.scheduleDate | details(c, c) }}</pre>
					</td>
					<td v-if="isAdmin || !permissions.edit">
						<strong>{{c.name}}</strong>
						<br/>
						<br/>
						<pre>{{ c.scheduleDate | details(c, c) }}</pre>
					</td>
					<td v-if="isAdmin">{{ c.dealerName | dealer }}</td>
					<td>{{ c.frequency | frequency }}</td>
					<td>{{ c.status | status(c, c) }}</td>
					<td v-if="c.totals">{{c.totals.sent}} Sent<br/>{{c.totals.failed}} Failed</td>
					<td v-if="!c.totals">No data available.<br/>Data is updated every hour.</td>
				</tr>
			</tbody>
		</table>
		<paginate
			v-if="pageCount > 1"
			:page-count="pageCount"
			:click-handler="getCampaigns"
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
		let can = this.loggedInUser.role.campaigns;
		if(!can.view)
			return this.$router.push('/');
	},
	computed : {
		...mapGetters(['loggedInUser', 'isAdmin', 'isSuperAdmin']),
		permissions(){
			return this.loggedInUser.role.campaigns;
		},
		pageCount(){
			return Math.ceil(this.totalRows / this.maxRows);
		}
	},
	mounted() {
		this.getDealers();
	},
	asyncData({ $axios, error }){
		return $axios.$get('/campaigns?sort=desc&page=1')
		.then((response) => {
			return {
				campaigns : response.data,
				maxRows : response.max,
				totalRows : response.total
			}
		})
		.catch((err) => {
			error({ message: 'Error fetching campaigns data' })
		});
	},
	data() {
		return {
			campaigns : [],
			maxRows : 1,
			totalRows : 1,
			dealers : [],
			filter : {
				search : '',
				dealer : '',
				frequency : '',
				status : ''
			}
		}
	},
	methods: {
		getDealers() {
			this.$axios.$get('/ikon/dealers')
			.then((response) => {
				this.dealers = response;
			})
			.catch((error) => {
				console.error(error);
				this.error = error;
			});
		},
		getCampaigns(page) {
			let url = '/campaigns?sort=desc&page=' + (page || 1);

			if(this.filter.search != "")
				url += '&campaign=' + this.filter.search;
			if(this.filter.dealer != "")
				url += '&dealer=' + this.filter.dealer;
			if(this.filter.frequency != "")
				url += '&frequency=' + this.filter.frequency;
			if(this.filter.status != "")
				url += '&status=' + this.filter.status;

			this.$axios.$get(url)
			.then((response) => {
				this.campaigns = response.data;
				this.maxRows = response.max;
				this.totalRows = response.total;
			})
			.catch((error) => {
				this.createAlert('error', "Error fetching campaigns data", error);
			});
		}
	},
	watch : {
		"filter.search"(value) {
			this.getCampaigns();
		},
		"filter.dealer"(value) {
			this.getCampaigns();
		},
		"filter.frequency"(value) {
			this.getCampaigns();
		},
		"filter.status"(value) {
			this.getCampaigns();
		}
	},
	filters : {
		frequency(value){
			if(value == 'send-once')
				return "Send Once";
			if(value == 'ongoing')
				return "Ongoing";
			return "";
		},
		status(status, campaign){
			switch(status){
				case 'sent':
					return "Sent";
					break;
				case 'stopped':
					return "Stopped";
					break;
				case 'sending':
					return "Sending";
					break;
				case 'pending':
					return "Pending";
					break;
				default:
					return "Scheduled";
			}
		},
		details(date, campaign){
			let scheduleDate = moment(campaign.scheduleDate);
			let detail = "";
			if(campaign.status == 'sent')
				detail = "Sent: " + scheduleDate.format('YYYY-MM-DD HH:mm');
			if(campaign.status == 'scheduled' && campaign.lastRunDate)
				detail = "Last: " + moment(campaign.lastRunDate).format('YYYY-MM-DD HH:mm') + '\n';
			if(campaign.status == 'scheduled' && campaign.nextSentDate)
				detail += "Next: " + moment(campaign.nextSentDate).format('YYYY-MM-DD HH:mm');
			return detail;
		},
		dealer(dealer){
			if(dealer == '')
				return "Created by Admin";
			return dealer;
		}
	}
}
</script>

<style>
pre{font-family: "Roboto";}
</style>
