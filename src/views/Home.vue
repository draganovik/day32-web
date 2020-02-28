<template>
  <main class="home">
    <EventEdit :event="items[this.selectedItem]" :toggle="toggleEdit"></EventEdit>
    <EventCreate></EventCreate>
    <div class="filters">
      <select name="CalendarView" id="calendarSelector">
        <option value="1">List view</option>
        <option value="2">Day view</option>
        <option value="3">Week view</option>
      </select>
      <select name="CalendarView" id="calendarSelector">
        <option value="1">Mix calendars</option>
        <option value="2">Primary</option>
        <option value="3">Schedule</option>
        <option value="3">Bitrhdays</option>
      </select>
      <select name="CalendarView" id="calendarSelector">
        <option value="-1">All colors</option>
        <option value="0">Default</option>
        <option value="1">Levander</option>
        <option value="2">Sage</option>
        <option value="3">Grape</option>
        <option value="4">Flamingo</option>
        <option value="5">Banana</option>
        <option value="6">Tangerine</option>
        <option value="7">Peacock</option>
        <option value="8">Graphite</option>
        <option value="9">Blueberry</option>
        <option value="10">Basil</option>
        <option value="11">Tomato</option>
      </select>
      <button class="btn search-event">
        ⌕
      </button>
    </div>
    <ul class="card-container">
      <EventCard
        v-for="item in items"
        :key="item.id"
        :item="item"
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
.search-event {
  background-color: transparent;
  border-radius: 2rem;
  padding: 0;
  border: 1px solid var(--foreground) !important;
  padding: 0 2rem;
  height: 2rem;
  max-height: 2rem;
  font-size: 1.45rem;
  box-sizing: border-box;
}
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
.filters {
  display: flex;
  max-width: calc(512px + 2rem);
  height: min-content;
  width: 100%;
  padding: 0 0.75rem;
  margin: 1.5rem auto;
  box-sizing: border-box;
  justify-content: space-between;
}
.filters * {
  margin: 0 0.25rem !important;
  width: 100% !important;
}
#calendarSelector {
  all: unset;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 2rem;
  padding: 0rem 1rem 0rem 0.6rem;
  margin: 0;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: linear-gradient(
      45deg,
      transparent 50%,
      var(--foreground) 50%
    ),
    linear-gradient(135deg, var(--foreground) 50%, transparent 50%);
  background-position: calc(100% - 0.72rem) calc(0.86rem),
    calc(100% - 0.5rem) calc(0.86rem);
  background-size: 0.25rem 0.25rem, 0.25rem 0.25rem;
  background-repeat: no-repeat;
  border: 1px solid var(--foreground);
  border-radius: 2rem;
  float: left;
  min-width: 50px;
  max-height: 2.5rem !important;
  height: 2rem;
}
@media (hover: hover) {
  .filters *:hover {
    cursor: pointer !important;
    user-select: none;
  }
}
</style>
