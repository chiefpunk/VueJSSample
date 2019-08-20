<template>
	<section class="wrapper container">
		<h1>Campaign Setup</h1>
		<div class="row">
			<div class="col">
				<form class="form">
					<div class="form-group">
						<label class="form-label" for="cp-name">Campaign Name</label>
						<input type="text" id="cp-name" v-model="post.name" class="form-control" aria-describedby="cp-name-help" placeholder="Set a name that help you identify this campaign, only you can see it." maxlength="80" required :disabled="status == 'sent'">
					</div>
					<div class="form-group">
						<label class="form-label" for="cp-text">Promo Text</label>
						<textarea id="cp-text" v-model="post.promoText" class="form-control" aria-describedby="cp-text-help" placeholder="Keep it relevant, brief and appealing." required :disabled="status == 'sent'"></textarea>
						<small id="cp-text-help" class="form-text" v-bind:class="{'text-muted': promoTextLength <= maxCharacters, 'text-danger': promoTexLength > maxCharacters}">
							{{maxCharacters - promoTextLength}} characters left
						</small>
					</div>
					<div class="form-group">
						<label class="form-label" for="cp-dealerurl">Dealer URL</label>
						<input type="text" id="cp-dealerurl" v-model="post.dealerUrl"  class="form-control" aria-describedby="cp-dealerurl-help" placeholder="Enter dealer website URL, optionally" :disabled="status == 'sent'">
					</div>
					<div class="form-group">
						<label class="form-label" for="cp-additionalurl">Additional URL</label>
						<input type="text" id="cp-additionalurl" v-model="post.additionalUrl" class="form-control" aria-describedby="cp-additionalurl-help" placeholder="Enter an additional URL, optionally" :disabled="status == 'sent'">
					</div>
					<div class="form-group">
						<label class="form-label">Campaign Type</label>
						<div class="form-group">
							<div class="form-check form-check-inline" v-if="!(this.id && this.post.campaignType == 'custom')">
								<input class="form-check-input" type="radio" name="cp-type" id="cp-type-predefined" v-model="post.campaignType" value="predefined">
								<label class="form-check-label" for="cp-type-predefined">Predefined</label>
							</div>
							<div class="form-check form-check-inline" v-if="!(this.id && this.post.campaignType == 'predefined')">
								<input class="form-check-input" type="radio" name="cp-type" id="cp-type-custom" v-model="post.campaignType" value="custom">
								<label class="form-check-label" for="cp-type-custom">Custom</label>
							</div>
						</div>
					</div>
					<div class="form-group" v-if="post.campaignType == 'predefined'">
						<select class="form-input custom-select" id="predefined-service" v-model="post.serviceId" v-on:change="getService" :disabled="!!id">
							<option value="">Services</option>
							<optgroup v-for="(options, group) in services" :label="group">
								<option :value="service.id" :data-mileage="service.mileageInterval" :data-days="service.dayInterval" v-for="service in options">
									Every {{ service.dayInterval ? service.dayInterval + ' days or' : '' }} {{ service.mileageInterval }} m.
								</option>
							</optgroup>
						</select>
					</div>
					<div class="form-group" v-if="post.campaignType == 'custom'">
						<div class="row">
							<div class="col-6">
								<label class="form-label">Query Builder</label>
							</div>
							<div class="col-4" v-if="!id">
								<select class="form-control form-control-sm custom-select" id="ruleSelector" v-model="selectedProperty" :disabled="!!id">
									<option v-if="!p.used" :value="i" data-operator="p.operator" v-for="(p, i) in properties">{{ p.name }}</option>
								</select>
							</div>
							<div class="col-2" v-if="!id">
								<button type="button" class="btn btn-sm btn-outline-primary btn-block" :disabled="selectedProperty == null" v-on:click="addRule">+ Rule</button>
							</div>
						</div>
					</div>
					<div class="form-group row" v-if="post.campaignType == 'custom'" v-for="(rule, r) in post.rules">
						<div class="col-4">
							<input type="text" class="form-control" :value="post.rules[r].name" readonly/>
						</div>
						<div class="col-3">
							<input type="text" class="form-control" :value="post.rules[r].operator" readonly/>
						</div>
						<div class="col-3">
							<input type="text" class="form-control" placeholder="Value" v-model="post.rules[r].value" :disabled="!!id">
						</div>
						<div class="col-2" v-if="!id">
							<button type="button" class="btn btn-sm btn-dark btn-block" v-on:click="removeRule" :data-index="r" :data-rule="post.rules[r].i">Delete</button>
						</div>
					</div>
					<div class="form-group">
						<label class="form-label">Delivery Frequency</label>
						<div class="form-check" v-if="!(this.id && this.post.frequency == 'send-once')">
							<input class="form-check-input" type="radio" name="cp-frequency" id="cp-frequency-ongoing" v-model="post.frequency" value="ongoing">
							<label class="form-check-label" for="cp-frequency-ongoing">Ongoing</label>
						</div>
						<div class="form-check" v-if="!(this.id && this.post.frequency == 'ongoing')">
							<input class="form-check-input" type="radio" name="cp-frequency" id="cp-frequency-send-once" v-model="post.frequency" value="send-once" :disabled="disabled.sendOnce">
							<label class="form-check-label" for="cp-frequency-send-once">Send Once</label>
						</div>

					</div>
					<div class="form-group" v-if="post.frequency == 'send-once'">
						<label class="form-label">Schedule</label>
						<p>Select date &amp; campaign start time<br/>Finishing time will depend on the total number of receivers.</p>
						<div class="input-group" style="width:40%;">
							<datetime type="datetime" v-model="post.scheduleDate" class="datetime-theme" input-class="form-control" format="MM-dd-yyyy HH:mm" :minute-step="15" placeholder="MM-DD-YYYY HH:MM" :min-datetime="minDate" :disabled="status == 'sent'"></datetime>
						</div>
					</div>
					<div class="form-group" v-if="post.frequency == 'ongoing'">
						<label class="form-label">Define Schedule</label>
						<div class="row">
							<div class="col-6">
								<p>Select the days for this campaign</p>
								<div class="form-check">
									<input class="form-check-input" type="checkbox" value="true" v-model="post.defineSchedule.monday" id="schedule-m">
									<label class="form-check-label" for="schedule-m">
										Monday
									</label>
								</div>
								<div class="form-check">
									<input class="form-check-input" type="checkbox" value="true" v-model="post.defineSchedule.tuesday" id="schedule-t">
									<label class="form-check-label" for="schedule-t">
										Tuesday
									</label>
								</div>
								<div class="form-check">
									<input class="form-check-input" type="checkbox" value="true" v-model="post.defineSchedule.wednesday" id="schedule-w">
									<label class="form-check-label" for="schedule-w">
										Wednesday
									</label>
								</div>
								<div class="form-check">
									<input class="form-check-input" type="checkbox" value="true" v-model="post.defineSchedule.thursday" id="schedule-h">
									<label class="form-check-label" for="schedule-h">
										Thursday
									</label>
								</div>
								<div class="form-check">
									<input class="form-check-input" type="checkbox" value="true" v-model="post.defineSchedule.friday" id="schedule-f">
									<label class="form-check-label" for="schedule-f">
										Friday
									</label>
								</div>
								<div class="form-check">
									<input class="form-check-input" type="checkbox" value="true" v-model="post.defineSchedule.saturday" id="schedule-s">
									<label class="form-check-label" for="schedule-s">
										Saturday
									</label>
								</div>
								<div class="form-check">
									<input class="form-check-input" type="checkbox" value="true" v-model="post.defineSchedule.sunday" id="schedule-u">
									<label class="form-check-label" for="schedule-u">
										Sunday
									</label>
								</div>
							</div>
							<div class="col-6">
								<p>Select at what time the campaign is sent.</p>
								<div class="input-group">
									<select class="form-control custom-select" v-model="post.defineSchedule.hour">
										<option v-for="hour in hours">
    										{{ hour }}
  										</option>
									</select>
									<select class="form-control custom-select" v-model="post.defineSchedule.minute">
										<option v-for="minute in minutes">
    										{{ minute }}
  										</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="form-group">
						<div v-if="!this.id">
							<button type="button" class="btn btn-primary" v-if="permissions.create && post.frequency == 'send-once'" v-on:click="sendForm">
								<span v-if="!post.scheduleDate">Send Now</span>
								<span v-if="post.scheduleDate">Schedule</span>
							</button>
							<button type="button" class="btn btn-primary" v-if="permissions.create && post.frequency == 'ongoing'" v-on:click="sendForm">Activate</button>
							<button class="btn btn-outline-primary" type="button" v-on:click="previewReach">Preview Reach</button>
							<button class="btn btn-outline-dark" type="button" v-on:click="cancel">Cancel</button>
						</div>
						<div v-if="this.id">
							<button v-if="permissions.edit && status == 'scheduled'" type="button" class="btn btn-primary" v-on:click="updateCampaign">Update</button>
							<button v-if="status == 'stopped'" type="button" class="btn btn-primary" v-on:click="resumeCampaign">Resume</button>
							<button class="btn btn-outline-primary" type="button" v-on:click="previewReach">Preview Reach</button>
							<button v-if="permissions.edit && status == 'scheduled'" type="button" class="btn btn-dark" v-on:click="stopCampaign">Stop</button>
							<button class="btn btn-outline-dark" type="button" v-on:click="cancel">Cancel</button>
							<button v-if="permissions.delete" type="button" class="btn btn-outline-dark float-right" v-on:click="removeCampaign">Delete</button>
						</div>
					</div>
				</form>
			</div>
			<div class="col">
				<form class="form" enctype="multipart/form-data" novalidate >
					<div class="form-group">
						<label class="form-label" for="cp-name">Campaign Image</label>
						<div class="input-group mb-3">
							<div class="custom-file">
								<input type="file" class="custom-file-input" id="cp-image" v-on:change="getImageSource" accept=".png,.jpg,.jpeg" :disabled="status == 'sent'">
								<label class="custom-file-label" for="cp-image" aria-describedby="cp-image-help">{{ imageLabel }}</label>
							</div>
						</div>
					</div>
				</form>
				<div class="row">
					<div class="col">
						<div class="phone-preview">
							<img src="/images/phone.png" alt="phone" />
							<div class="card preview-card">
								<img v-bind:src="imagePreview" class="card-img-top" />
								<div class="card-body" v-if="post.promoText">
									<div class="card-text">
										{{post.promoText}}
										<div class="card-link" v-if="post.dealerUrl">Our website <span>{{post.dealerUrl}}</span></div>
										<div class="card-link" v-if="post.additionalUrl"><span>{{post.additionalUrl}}</span></div>
<!--										<div>Powered by IkonGPS 1-888-816-8050</div>-->
										<div>Reply STOP to unsubscribe</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="col">
						<div class="form-group">
							<label class="form-label" for="cp-test">Send Campaign Test</label>
							<input type="text" id="cp-test" class="form-control" placeholder="10 digit number" maxlength="10" v-model="testNumber" :disabled="status == 'sent'">
							<button type="button" id="send-test" class="btn btn-outline-primary" v-on:click="testDialog">Send Test</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import { Datetime } from 'vue-datetime';
import { mapGetters } from 'vuex';
import moment from 'moment';
import config from '../../nuxt.config.js';
// let config = require('../../nuxt.config.js');

// TODO remove logging; visual validation of correct env
console.log('server', config.server);
export default {
	created() {
		let can = this.loggedInUser.role.campaigns;
		if(!can.create && !can.edit && !can.activate && !can.delete)
			return this.$router.push('/campaigns');
	},
	computed : {
		...mapGetters(['loggedInUser', 'isSuperAdmin']),
		permissions(){
			return this.loggedInUser.role.campaigns;
		},
		dealerUrl(){
			return this.loggedInUser.dealershipUrl;
		},
		minDate(){
			return moment().toISOString();
		},
		promoTextLength(){
			let string = this.post.promoText;
			if(this.post.additionalUrl)
				string += "\n" + this.post.additionalUrl;
			if(this.post.dealerUrl)
				string += "Our website " + this.post.dealerUrl;
			// string += "\n" + "Powered by IkonGPS 1-888-816-8050";
			string += "\n" + "Reply STOP to unsubscribe";
			return string.length;
		}
	},
	components : {
    	datetime : Datetime
	},
	mounted() {
		this.post.dealerUrl = this.dealerUrl;
		if(this.$route.params.id != 'new'){
			if(this.isSuperAdmin) return this.$router.push('/campaigns');
			this.id = this.$route.params.id;
			this.getCampaign();
		}
		this.getServices();
	},
	data() {
		let defaultImageLabel = 'Choose file...';
		return {
			id : null,
			status : null,
			error : null,
			maxCharacters : config.validator.maxBodyLength,
			hours : ['HH','0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
			minutes : ['MM','00','05','10','15','20','25','30','35','40','45','50','55'],
			services : [],
			imageSource : "",
			defaultImageLabel: defaultImageLabel,
			imageLabel : defaultImageLabel,
			imagePreview : "",
			testNumber : null,
			disabled : {
				sendOnce : true
			},
			properties : [
				{ i: 0, id:"mileageInterval", name: "Mileage", operator : ">", used : false },
				{ i: 1, id:"dayInterval", name: "Time", operator : ">", used : false },
				{ i: 2, id:"year", name: "Vehicle year", operator : "=", used : false },
				{ i: 3, id:"make", name: "Vehicle make", operator : "=", used : false },
				{ i: 4, id:"model", name: "Vehicle model", operator : "=", used : false },
				{ i: 5, id:"customerName", name: "Customer Name", operator : "like", used : false },
				{ i: 6, id:"customerZip", name: "Customer Zip Code", operator : "=", used : false },
				{ i: 7, id:"customerCity", name: "Customer City", operator : "=", used : false }
			],
			selectedProperty : 0,
			post : {
				name : '',
				promoText : '',
				dealerUrl : '',
				additionalUrl : '',
				image : '',
				campaignType : 'predefined',
				serviceId : '',
				service : '',
				rules : [],
				frequency : 'ongoing',
				scheduleDate : null,
				defineSchedule : {
					monday : false,
					tuesday : false,
					wednesday : false,
					thursday : false,
					friday : false,
					saturday : false,
					sunday : false,
					hour : 'HH',
					minute : 'MM'
				}
			}
		}
	},
	methods: {
		testDialog(){
			if(this.testNumber.length != 10 || isNaN(this.testNumber))
				return this.createAlert('error', "Validation", "Invalid test number");
			this.createDialog(
				'Test Message',
				'This will send a test message to ' + this.testNumber,
				'Send',
				'Cancel',
				() => {
					this.sendTest();
					this.closeDialog();
				}
			);
		},
		getService(e){
			if(e.target.options.selectedIndex > -1) {
            	this.post.service = {
					mileageInterval : e.target.options[e.target.options.selectedIndex].dataset.mileage,
					dayInterval : e.target.options[e.target.options.selectedIndex].dataset.days
				};
        	}
		},
		addRule() {
			let rule = this.properties[this.selectedProperty];
			if(rule.i == 0 && this.post.frequency == 'send-once'){
				return this.createAlert('warn', "Validation", "Mileage intervals cannot be used with Delivery Frequency of Send Once");
			}
			if(rule.i == 1 && this.post.frequency == 'send-once'){
				return this.createAlert('warn', "Validation", "Time intervals cannot be used with Delivery Frequency of Send Once");
			}
			this.post.rules.push({"i" : rule.i, "id" : rule.id, "name": rule.name, "operator": rule.operator, "value": null});
			this.properties[this.selectedProperty].used = true;
			this.selectedProperty = null;
			this.properties.some((p, i) => { if(!p.used){ this.selectedProperty = i ; return true; } return false; });
		},
		removeRule(button) {
			let index = parseInt($(button.target).attr('data-index'));
			let rule = parseInt($(button.target).attr('data-rule'));
			this.properties[rule].used = false;
			this.post.rules.splice(index, 1);
			this.properties.some((p, i) => { if(!p.used){ this.selectedProperty = i ; return true; } return false; });
		},
		getCampaign(){
			this.$axios.$get('/campaigns/' + this.id)
			.then((response) => {
				this.status = response.status;
				this.post.name = response.name;
				this.post.promoText = response.promoText;
				this.post.dealerUrl = response.dealerUrl;
				this.post.additionalUrl = response.additionalUrl;
				this.post.image = response.image;
				this.imagePreview = response.imageURL;
				this.post.campaignType = response.campaignType;
				this.post.serviceId = response.serviceId;
				this.post.frequency = response.frequency;
				this.post.scheduleDate = response.scheduleDate;
				if(response.rules)
					this.post.rules = response.rules;
				if(response.defineSchedule){
					this.post.defineSchedule = response.defineSchedule;
					if(this.post.defineSchedule.hour == 0)
						this.post.defineSchedule.hour = '00';
					if(this.post.defineSchedule.minute == 0)
						this.post.defineSchedule.minute = '00';
				}
			})
			.catch((error) => {
				this.createAlert('error', "Error fetching campaign data", error);
			});
		},
		getServices() {
			this.$axios.$get('/ikon/services')
			.then((response) => {
				let grouped = {};
				response.forEach((service) => {
					if(!grouped[service.name])
						grouped[service.name] = [];
					grouped[service.name].push(service);
				});
				this.services = grouped;
			})
			.catch((error) => {
				this.createAlert('warn', "Services", "Error fetching services data");
			});
		},
		getImageSource(input) {
			if (!input.target.files || !input.target.files[0]) {
				this.clearImage();
				return;
			}
			// validate image
			let file = input.target.files[0];
			if (file.name.search(/jpg|jpeg|png/) == -1) {
				this.createAlert('error', "Campaign Image", "Select a Campaign Image of type (jpg, jpeg, png)");
				return;
			}
			if (file.size > 1048576) {
				this.createAlert('error', "Campaign Image", "Select a Campaign Image smaller than 1MB");
				return;
			}

			this.imageSource = file;
			this.imageLabel = file.name;

			let headers = { 'Content-Type': 'multipart/form-data' };
			let formData = new FormData();
			formData.append('image', this.imageSource);
			this.$axios.$post('/campaigns/image', formData, { headers })
			.then((response) => {
				this.post.image = response.id;
				this.imagePreview = response.imageURL;
			})
			.catch((error) => {
				this.clearImage();
				this.createAlert('error', "Error fetching image data", error);
			});
		},
		/**
		 * clear image and preview
		 */
		clearImage() {
			this.imageSource = '';
			this.imageLabel = this.defaultImageLabel;
			this.post.image = null;
			this.imagePreview = '';
		},
		sendTest(){
			this.validateForm()
			.then(() => {
				let formData = {
					body : this.post.promoText,
					recipient : this.testNumber
				};
				if(this.imagePreview)
					formData.mediaUrl = this.imagePreview;
				if(this.post.dealerUrl)
					formData.body += "\n" + "Our website " + this.post.dealerUrl;
				if(this.post.additionalUrl)
					formData.body += "\n" + this.post.additionalUrl;
				// formData.body += "\n" + "Powered by IkonGPS 1-888-816-8050";
				formData.body += "\n" + "Reply STOP to unsubscribe";
				this.$axios.$post('/ikon/test', formData)
				.then((response) => {
					this.createAlert('success', "Test", "Message has been sent");
				})
				.catch((error) => {
					this.createAlert('error', "Error sending test", error);
				});
			})
			.catch((e) => {
				console.warn("Invalid form.", e);
			});
		},
		sendForm(){
			this.validateForm()
			.then(() => {
				let formData = this.getPreparedCampaign();
				this.$axios.$post('/campaigns', formData)
				.then((response) => {
					this.createAlert('success', "Create", "Campaign created successfully.");
					this.$router.push('/campaigns');
				})
				.catch((error) => {
					this.createAlert('error', "Error creating campaign", error);
				});
			})
			.catch(() => {
				console.warn("Error while sending.");
			});
		},
		validateForm(){
			return new Promise((resolve, reject) => {
				if(this.post.name == ''){
					this.createAlert('error', "Validation", "Campaign Name can not be empty.");
					return reject();
				}
				if(this.post.name.length > 80){
					this.createAlert('error', "Validation", "Campaign Name is longer than 80 characters.");
					return reject();
				}
				if(this.post.promoText == ''){
					this.createAlert('error', "Validation", "Promo Text is can not be empty.");
					return reject();
				}
				if(this.promoTextLength > this.maxCharacters){
					this.createAlert('error', "Validation", "Promo Text is longer than " + this.maxCharacters + " characters.");
					return reject();
				}
				if(this.post.dealershipUrl && this.post.dealershipUrl.length > 0 && this.post.dealershipUrl.length < 8){
					this.createAlert('error', "Validation", "Invalid Dealer URL");
					return reject();
				}
				if(this.post.additionalUrl && this.post.additionalUrl.length > 0 && this.post.additionalUrl.length < 8){
					this.createAlert('error', "Validation", "Invalid Additional URL");
					return reject();
				}
				if(this.post.campaignType == 'predefined' && !this.post.serviceId){
					this.createAlert('error', "Validation", "Please select the type of predefined campaign service.");
					return reject();
				}
				if(this.post.campaignType == 'custom'){
					if(!this.post.rules.length){
						this.createAlert('error', "Validation", "Please select at least one rule on the query builder.");
						return reject();
					}
					let ruleError = false;
					this.post.rules.some((rule, i) => {
						if(rule.value == '' || rule.value == null){
							this.createAlert('error', "Validation", "Please type a value for every rule on the query builder.");
							ruleError = true;
						}
					});
					if(ruleError) return reject();
				}
				let ds = this.post.defineSchedule;
				if(this.post.frequency == 'ongoing' && !(ds.monday || ds.tuesday || ds.wednesday || ds.thursday || ds.friday || ds.saturday || ds.sunday)){
					this.createAlert('error', "Validation", "Please make a schedule assignment. Select day(s) and start time for the campaign to run.");
					return reject();
				}
				if(this.post.frequency == 'ongoing' && (ds.hour == 'HH' || ds.minute == 'MM')){
					this.createAlert('error', "Validation", "Please make a schedule assignment. Select day(s) and start time for the campaign to run.");
					return reject();
				}
				if(this.post.frequency == 'send-once' && moment(this.post.scheduleDate).isBefore()){
					this.createAlert('error', "Validation", "Can not schedule campaign to run in the past.");
					return reject();
				}
				resolve();
			});
		},
		validateForPreview(){
			return new Promise((resolve, reject) => {
				if(this.post.campaignType == 'predefined' && !this.post.serviceId){
					this.createAlert('error', "Validation", "Please select the type of predefined campaign service.");
					return reject();
				}
				if(this.post.campaignType == 'custom'){
					if(!this.post.rules.length){
						this.createAlert('error', "Validation", "Please select at least one rule on the query builder.");
						return reject();
					}
					let ruleError = false;
					this.post.rules.some((rule, i) => {
						if(rule.value == '' || rule.value == null){
							this.createAlert('error', "Validation", "Please type a value for every rule on the query builder.");
							ruleError = true;
						}
					});
					if(ruleError) return reject();
				}
				resolve();
			});
		},
		getPreparedCampaign(){
			let formData = this.post;

			if(this.post.campaignType == 'predefined')
				delete formData.rules;
			if(this.post.campaignType == 'custom'){
				delete formData.serviceId;
				delete formData.service;
			}

			if(this.imagePreview == '')
				delete formData.image;

			if(this.post.frequency == 'send-once')
				delete formData.defineSchedule;
			else{
				formData.defineSchedule.interval = {};
				let day;
				if(formData.defineSchedule.monday){
					day = moment().day(1).hour(formData.defineSchedule.hour).minute(formData.defineSchedule.minute).second(0);
					formData.defineSchedule.interval[1] = moment.utc(day).toDate();
				}
				if(formData.defineSchedule.tuesday){
					day = moment().day(2).hour(formData.defineSchedule.hour).minute(formData.defineSchedule.minute).second(0);
					formData.defineSchedule.interval[2] = moment.utc(day).toDate();
				}
				if(formData.defineSchedule.wednesday){
					day = moment().day(3).hour(formData.defineSchedule.hour).minute(formData.defineSchedule.minute).second(0);
					formData.defineSchedule.interval[3] = moment.utc(day).toDate();
				}
				if(formData.defineSchedule.thursday){
					day = moment().day(4).hour(formData.defineSchedule.hour).minute(formData.defineSchedule.minute).second(0);
					formData.defineSchedule.interval[4] = moment.utc(day).toDate();
				}
				if(formData.defineSchedule.friday){
					day = moment().day(5).hour(formData.defineSchedule.hour).minute(formData.defineSchedule.minute).second(0);
					formData.defineSchedule.interval[5] = moment.utc(day).toDate();
				}
				if(formData.defineSchedule.saturday){
					day = moment().day(6).hour(formData.defineSchedule.hour).minute(formData.defineSchedule.minute).second(0);
					formData.defineSchedule.interval[6] = moment.utc(day).toDate();
				}
				if(formData.defineSchedule.sunday){
					day = moment().day(7).hour(formData.defineSchedule.hour).minute(formData.defineSchedule.minute).second(0);
					formData.defineSchedule.interval[7] = moment.utc(day).toDate();
				}
				formData.defineSchedule.hour = parseInt(formData.defineSchedule.hour);
				formData.defineSchedule.minute = parseInt(formData.defineSchedule.minute);
			}
			if(this.post.dealerUrl == '')
				delete formData.dealerUrl;

			return formData;
		},
		stopCampaign(){
			this.$axios.$put('/campaigns/stop/' + this.id, { status : false })
			.then((response) => {
				this.createAlert('success', "Stop", "Campaign stopped successfully.");
				this.$router.push('/campaigns');
			})
			.catch((error) => {
				this.createAlert('error', "Error stopping campaign", error);
			});
		},
		resumeCampaign(){
			this.$axios.$put('/campaigns/resume/' + this.id, { status : false })
			.then((response) => {
				this.createAlert('success', "Resume", "Campaign resumed successfully.");
				this.$router.push('/campaigns');
			})
			.catch((error) => {
				this.createAlert('error', "Error resuming campaign", error);
			});
		},
		updateCampaign(){
			this.validateForm()
			.then(() => {
				let formData = this.getPreparedCampaign();
				this.$axios.$put('/campaigns/' + this.id, formData)
				.then((response) => {
					this.createAlert('success', "Create", "Campaign created successfully.");
					this.$router.push('/campaigns');
				})
				.catch((error) => {
					this.createAlert('error', "Error creating campaign", error);
				});
			})
			.catch(() => {
				console.warn("Invalid form.");
			});
		},
		removeCampaign(){
			this.$axios.$delete('/campaigns/' + this.id)
			.then((response) => {
				this.createAlert('success', "Delete", "Campaign deleted successfully.");
				this.$router.push('/campaigns');
			})
			.catch((error) => {
				this.createAlert('error', "Error deleting campaign", error);
			});
		},
		cancel(){
			this.$router.push('/campaigns');
		},
		previewReach(){
			this.validateForPreview()
			.then(() => {
				let formData = {};
				formData.campaignType = this.post.campaignType;
				formData.frequency = this.post.frequency;
				if(formData.campaignType == 'predefined'){
					formData.serviceId = this.post.serviceId;
				}
				if(formData.campaignType == 'custom'){
					formData.rules = this.post.rules;
				}
				if(formData.frequency == 'ongoing')
					formData.defineSchedule = this.post.defineSchedule;

				this.$axios.$post('/campaigns/preview', formData)
				.then((response) => {
					this.createAlert('success', "Preview Reach", "There are currently " + response.reach + " customers that match the campaign.");
				})
				.catch((error) => {
					this.createAlert('error', "Preview Reach", error);
				});
			})
			.catch(() => {
				console.warn("Invalid form.");
			});
		}
	},
	watch : {
		"post.frequency"(value) {
			if(value == 'send-once' && this.post.campaignType == 'custom'){
				if(this.properties[1].used){
					this.properties[1].used = false;
					this.post.rules.forEach((rule, index) => {
						if(rule.i == 1){
							this.post.rules.splice(index, 1);
						}
					});
					this.createAlert('warn', "Validation", "Time intervals cannot be used with Delivery Frequency of Send Once");
				}
				if(this.properties[0].used){
					this.properties[0].used = false;
					this.post.rules.forEach((rule, index) => {
						if(rule.i == 0){
							this.post.rules.splice(index, 1);
						}
					});
					this.createAlert('warn', "Validation", "Mileage intervals cannot be used with Delivery Frequency of Send Once");
				}
				this.selectedProperty = 0;
			}
		},
		"post.campaignType"(value){
			if(value == 'custom') this.post.serviceId = '';
		},
		"post.serviceId"(value) {
			if(value != ''){
				this.disabled.sendOnce = true;
				this.post.frequency = 'ongoing';
			} else {
				this.disabled.sendOnce = false;
			}
		},
		"properties" : {
			handler(value){
				if(this.properties[0].used || this.properties[1].used){
					this.post.frequency = 'ongoing';
					this.disabled.sendOnce = true;
				} else {
					this.disabled.sendOnce = false;
				}
			},
			deep : true
		}
	},
}
</script>

<style>
.phone-preview{ position: relative; }
.preview-card{ max-width: 200px; position: absolute; top: 0; margin: 70px 35px; }
.card-body{ background: #E5E5EA; padding: 0.5em; word-break: break-word; }
.card-text{ font-size: 0.8em; }
.card-link span{ color: #00F; word-break: break-all; }
.card-link + .card-link{ margin-left: 0 !important; }
#send-test{ margin-top: 10px; }

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
</style>
