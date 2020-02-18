<template>
  <main class="home">
    <EventEdit :event="items[this.selectedItem]" :toggle="toggleEdit"></EventEdit>
    <EventCreate></EventCreate>
    <ul class="card-container">
      <EventCard v-for="item in items" :key="item.id" :item="item" v-on:click.native="selectEvent(items.indexOf(item))"></EventCard>
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
import EventCreate from '@/views/EventCreate.vue'

export default {
  name: 'home',
  data: function () {
    return {
      items: JSON.parse(localStorage.getItem('Events')),
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
    },
    getEvents: function () {
      this.$gapi
        .request({
          path:
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          method: 'GET',
          params: {
            timeMin: new Date().toISOString(),
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime'
          }
        })
        .then(response => {
          this.items = response.result.items
          if (response) {
            localStorage.setItem('Events', JSON.stringify(this.items))
            console.log(this.items)
          }
        })
    }
  },
  created: async function () {
    await this.getEvents()
  }
}
</script>

<style scoped>
ul {
  margin: 0;
  padding: 1.4rem;
  padding-top: 0;
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
