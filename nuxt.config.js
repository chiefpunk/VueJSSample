const path = require('path');

// check for env file
let env;
try {
	// (base)/
	// require ('./env-stg');
	// using exports, as when require from .vue, build causes warning 'Module not found: Error: Can't resolve './env-stg''
	env = require ('./env');
	env = env.env;
} catch (e) {
	// default prod
	env = 'prod';
}

// check for env based nuxt config when called from different relative paths
let configPath;
let config;
try {
	// (base)/
	configPath = `./nuxt.config-${env}.js`;
	// config = require(configPath); // on build, results in warning 'Critical dependency: the request of a dependency is an expression'
	config = require(`./nuxt.config-${env}.js`);
} catch (e) {
	try {
		// (base)/server/
		configPath = `../nuxt.config-${env}.js`;
		config = require(`../nuxt.config-${env}.js`);
	} catch (e) {
		// (base)/pages/dir/
		configPath = `../../nuxt.config-${env}.js`;
		config = require(`../../nuxt.config-${env}.js`);
	}
}

// TODO remove logging; visual validation of correct env
console.log('Building nuxt using ' + configPath);
module.exports = config;
