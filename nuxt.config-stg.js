
module.exports = {
	mode: 'spa',
	router: { middleware: 'auth' },
	head: {
		title: 'Staging - IkonGPS Campaign Manager',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' }
		],
		link: [
			{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
			{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Material+Icons|Roboto:300,400,700&display=swap' },
			{ rel: 'stylesheet', href: '/css/vue-datetime.min.css' }
		],
		script: [
			{ src: "https://code.jquery.com/jquery-3.3.1.slim.min.js", integrity: "sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo", crossorigin: "anonymous" },
			{ src: "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js", integrity: "sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1", crossorigin: "anonymous" },
			{ src: "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js", integrity: "sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM", crossorigin: "anonymous" },
			// { src: "/js/scripts.js" }
		]
	},
	css: [ '@/assets/scss/app.scss' ],
	loading: { color: '#7BE52F' },
	modules: [
		['bootstrap-vue/nuxt', { css: false }],
		'@nuxtjs/axios',
		'@nuxtjs/auth'
	],
	auth: {
		strategies: {
			local: {
				endpoints: {
					login: { url: 'login', method: 'post', propertyName: 'jwt' },
					user: { url: 'me', method: 'get', propertyName: false },
					logout: false
				},
				tokenRequired: true,
				tokenType: null,
				tokenName: 'token',
			}
		},
		redirect: {
			forgot: '/forgot'
		}
	},
	plugins: [ '~/plugins/utils', '~/plugins/vue-js-modal', '~/plugins/vue-notification', '~/plugins/vue-pagination' ],
	axios: { baseURL: 'https://campaignstg.ikongps.com/cmapistg' }, // no trailing /
	server: { port: 9013 },
	validator: { maxBodyLength : 1500 }
};
