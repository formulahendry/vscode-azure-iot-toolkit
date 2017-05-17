<template>
  <div class="devices">
    <h1>{{ msg }}</h1>
    <ul id="example-1">
        <li v-for="item in items">
            {{ item }}
        </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'devices',
  data () {
    return {
      msg: 'Welcome to Devices!',
      items: ['d1', 'd2']
    }
  }
}
</script>


<style scoped>

</style>
