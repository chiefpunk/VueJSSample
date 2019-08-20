import Vue from 'vue'

Vue.mixin({
	methods: {
		createDialog(title, text, buttonText, cancelText, handler){
			this.$modal.show('dialog', {
				title: title,
				text: text,
				buttons: [
					{
						title: buttonText,
						default: true,
						handler: handler
					},
					{
						title: cancelText
					}
				]
			})
		},
		closeDialog(){
			this.$modal.hide('dialog');
		},
		createAlert(type, title, text){
			if(text.response){
				let dataError = text.response.data;
				if(dataError.error.code == 33){
					text = "";
					for (let err of dataError.details) {
						let property = err.property.toString().split('.')[1];
						text += property+" - "+err.message+". <br>";
					}
				} else {
					dataError = dataError.error;
					text = dataError.message;
				}
			}
			let durationTime = 4000;
			if(type != 'success'){
				durationTime = 10000;
			}			
			this.$notify({
				type : type || 'info',
				group : 'alerts',
				title : title || '',
				text : text,
				duration : durationTime
			});
		}
	}
})
