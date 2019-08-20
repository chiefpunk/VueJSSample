<template>
	<section class="wrapper container">
		<h1 class="text-center">{{error.message}}</h1>
	</section>
</template>
<script>
export default {
	props: ['error'],
	layout: 'default'
}
</script>
