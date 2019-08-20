<template>
	<section class="wrapper">
		<h1>Delivery Report</h1>
		<table class="table table-borderless">
			<thead>
				<tr>
					<td>
						<div class="input-group search-input-group">
							<div class="input-group-prepend">
								<div class="input-group-text"><i class="material-icons mb-18">search</i></div>
							</div>
							<input type="text" class="form-control" v-model="filter.search" placeholder="Search by Data">
						</div>
					</td>
					<td width="200">
						<div class="input-group select-input-group">
							<label>Date:</label>
							<datetime type="date" v-model="filter.date" value-zone="local" class="datetime-theme" input-class="form-control" format="yyyy-MM-dd"></datetime>
						</div>
					</td>
					<td v-if="isAdmin">
						<div class="input-group select-input-group">
							<label>Dealer:</label>
							<select class="form-control" v-model="filter.dealer">
								<option value="">All</option>
								<option :value="dealer.name" v-for="dealer in dealers">{{dealer.name}}</option>
							</select>
						</div>
					</td>
					<td>
						<div class="input-group select-input-group">
							<label>Status:</label>
							<select class="form-control" v-model="filter.status">
								<option value="">All</option>
								<option value="sent">Sent</option>
								<option value="failed">Failed</option>
							</select>
						</div>
					</td>
				</tr>
				<tr>
					<th scope="col">Cell#</th>
					<th scope="col">Send Date</th>
					<th v-if="isAdmin" scope="col">Dealer</th>
					<th scope="col">Status</th>
					<th scope="col">Campaign</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="!rows.length">
					<td colspan="5"><p>No data to display.</p></td>
				</tr>
				<tr v-for="r in rows">
					<td>{{ r.cells }}</td>
					<td>{{ r.sendDate | sendDate }}</td>
					<td v-if="isAdmin">{{ r.dealer }}</td>
					<td>{{ r.status | status }}</td>
					<td>{{ r.campaign }}</td>
				</tr>
			</tbody>
		</table>
		<paginate
			v-if="pageCount > 1"
			:page-count="pageCount"
			:click-handler="getReport"
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
import { Datetime } from 'vue-datetime';
import { mapGetters } from 'vuex';

export default {
	created() {
		if(!this.loggedInUser.role.reports.view)
			this.$router.push('/');
	},
	computed : {
		...mapGetters(['loggedInUser', 'isAdmin']),
		permissions(){
			return this.loggedInUser.role;
		},
		pageCount(){
			return Math.ceil(this.totalRows / this.maxRows);
		}
	},
	components : {
    	datetime : Datetime
	},
	mounted() {
		this.getDealers();
	},
	asyncData({ $axios, error }) {
		return $axios.$get('/reports/delivery?sort=desc&page=1&date='+moment().startOf('day').toJSON())
		.then((response) => {
			return {
				rows : response.data,
				maxRows : response.max,
				totalRows : response.total
			}
		})
		.catch((err) => {
			error({ message: 'Error fetching report data' });
		});
	},
	data() {
		return {
			rows : [],
			maxRows : 1,
			totalRows : 1,
			currentData : '{}',
			dealers : [],
			status : ['sent','failed'],
			filter : {
				search : '',
				date : moment().format(),
				dealer : '',
				status : ''
			}
		}
	},
	methods: {
		getReport() {
			let url = '/reports/delivery?sort=desc&page=1';

			if(this.filter.dealer != "")
				url += '&dealer=' + this.filter.dealer;
			if(this.filter.search != "")
				url += '&search=' + this.filter.search;
			if(this.filter.status != "")
				url += '&status=' + this.filter.status;
			if(this.filter.date != "")
				url += '&date=' + moment(this.filter.date).startOf('day').toJSON();

			this.$axios.$get(url)
			.then((response) => {
				this.rows = response.data;
				this.maxRows = response.max;
				this.totalRows = response.total;
			})
			.catch((error) => {
				console.error(error);
				this.error = error;
			});
		},
		getDealers() {
			this.$axios.$get('/ikon/dealers')
			.then((response) => {
				this.dealers = response;
			})
			.catch((error) => {
				console.error(error);
				this.error = error;
			});
		}
	},
	watch : {
		"filter.search"(value) {
			this.getReport();
		},
		"filter.status"(value) {
			this.getReport();
		},
		"filter.date"(value) {
			this.getReport();
		},
		"filter.dealer"(value) {
			this.getReport();
		}
	},
	filters : {
		sendDate(sendDate){
			return moment(sendDate).format('YYYY-MM-DD HH:mm');
		},
		status(status){
			if(status == "sent")
				return "Sent";
			return "Failed";
		}
	}
}
/*
{
        "cells": "+17377048023",
        "sendDate": "2019-07-12T16:20:00.000Z",
        "dealer": "",
        "status": "sent",
        "campaign": "First campaign"
    }
*/
</script>

<style>
.datetime-theme .vdatetime-popup__header,
.datetime-theme .vdatetime-calendar__month__day--selected > span > span,
.datetime-theme .vdatetime-calendar__month__day--selected:hover > span > span {
  background: #7BE52F;
}
.datetime-theme .vdatetime-year-picker__item--selected,
.datetime-theme .vdatetime-time-picker__item--selected,
.datetime-theme .vdatetime-popup__actions__button {
  color: #7BE52F;
}
.select-input-group{max-width: 200px !important;}
.select-input-group input{background: transparent; border: none; border-radius: 0; border-bottom: solid #7BE52F 2px; width: 110px;}
</style>
