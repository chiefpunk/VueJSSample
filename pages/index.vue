<template>
	<div class="container">
		<p>{{notice}}</p>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	created() {
		let can = this.loggedInUser.role;
		if(can.roles.view)
			return this.$router.push('/roles');
		if(can.campaigns.view)
			return this.$router.push('/campaigns');
		if(can.users.view)
			return this.$router.push('/users');
		if(can.reports.view)
			return this.$router.push('/reports/activity');
	},
	computed : {
		...mapGetters(['loggedInUser'])
	},
	data(){
		return {
			notice : ""
		}
	}
}
</script>

<style>

</style>
