export const getters = {
	isAuthenticated(state) {
		return state.auth.loggedIn
	},

	loggedInUser(state) {
		return state.auth.user
	},

	isSuperAdmin(state) {
		return (state.auth.user.dealershipId == "fortytwo")
	},

	isAdmin(state) {
		return (state.auth.user.role.roles.create)
	}
}
