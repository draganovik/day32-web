<template>
  <main class="home">
    <EventEdit :event="items[this.selectedItem]" :toggle="toggleEdit"></EventEdit>
    <EventCreate></EventCreate>
    <ul class="card-container">
      <EventCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :previousTime="items.indexOf(item) > 0 ? items[items.indexOf(item)-1].start.dateTime : undefined"
        v-on:click.native="selectEvent(items.indexOf(item))"
      ></EventCard>
      <h1 class="h1-center" v-if="items.length < 1">You have no upcoming events!</h1>
      <br />
      <br />
      <br />
      <br />
      <br />
    </ul>
    <br />
  </main>
</template>

<script>
import EventCard from '@/components/EventCard.vue'
import EventEdit from '@/components/EventEdit.vue'
import EventCreate from '@/components/EventCreate.vue'

export default {
  name: 'home',
  data: function () {
    return {
      selectedItem: -1,
      toggleEdit: null
    }
  },
  components: {
    EventCard,
    EventCreate,
    EventEdit
  },
  methods: {
    selectEvent: function (itemId) {
      this.selectedItem = itemId
      this.toggleEdit = Date.now()
    }
  },
  mounted () {
    this.$store.getters.GET_GOOGLE_CALENDARS(this.$gapi)
  },
  computed: {
    items () {
      return this.$store.state.googleCalendars.primary
    }
  }
}
</script>

<style scoped>
ul {
  margin: 0;
  padding: 1.4rem;
  padding-top: 2rem;
  text-align: center;
}
h1 {
  font-size: 1.8rem;
}
.h1-center {
  position: absolute;
  width: 100vw;
  box-sizing: border-box;
  top: 50%;
  left: 0;
  -ms-transform: translateY(-120%);
  transform: translateY(-120%);
}
</style>
