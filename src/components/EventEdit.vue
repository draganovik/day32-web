<template>
  <section ref="overlay" class="noned push" v-on:click="toggleEventCard()">
    <div class="page" ref="page" v-on:click.stop>
      <div class="form">
        <input
          type="text"
          placeholder="Title"
          v-model="event.summary"
          ref="finput"
          tabindex="1"
        />
        <input
          type="button"
          class="btn"
          style="width:70%;box-sizing:border-box;"
          ref="adbtn"
          v-on:click="allDay()"
          value="Set without time"
          tabindex="-1"
        />
        <input
          type="datetime-local"
          ref="sdate"
          v-model="event.start.dateTime"
          tabindex="2"
        />
        <input
          type="datetime-local"
          ref="edate"
          class="tdate"
          v-model="event.end.dateTime"
          tabindex="3"
        />
        <input
          type="date"
          ref="adate"
          class="noned"
          v-model="event.start.date"
          tabindex="4"
        />
        <input
          type="text"
          placeholder="Location"
          v-model="event.location"
          tabindex="5"
        />
        <select name="color" id="clr" v-model="event.colorId" tabindex="6">
          <option value="undefined">Default</option>
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
        <textarea
          name="desc"
          rows="8"
          cols="4"
          placeholder="Description"
          v-model="event.description"
          tabindex="7"
        ></textarea>
        <div
          style="display:flex; justify-content: space-between; width:70%; margin: auto"
        >
          <button class="btn ac" v-on:click="toggleEventCard()">Discard</button>
          <button
            class="btn ac"
            v-on:click="updateEvent()"
            tabindex="8"
            style="background-color: var(--accent); color: white"
          >
            Save
          </button>
        </div>
        <br />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  methods: {
    toggleEventCard: function () {
      var overlay = this.$refs.overlay
      if (
        overlay.classList.contains('push') &&
        overlay.classList.contains('noned')
      ) {
        overlay.classList.remove('noned')
        overlay.classList.remove('hide')
        setTimeout(function () {
          overlay.classList.remove('push')
        }, 1)
        this.$refs.finput.focus()
      } else {
        overlay.classList.add('push')
        setTimeout(function () {
          overlay.classList.add('hide')
          setTimeout(function () {
            overlay.classList.add('noned')
          }, 200)
        }, 100)
      }
    },
    validateTime: function () {
      if (new Date(this.event.start.date)) {
        if (new Date(this.event.start.date) <= new Date(this.event.end.date)) { return true }
      }
      if (new Date(this.event.start.dateTime)) {
        if (
          new Date(this.event.start.dateTime) <=
          new Date(this.event.end.dateTime)
        ) { return true }
      }
      return false
    },
    updateEvent: function () {
      if (this.event.summary !== '' && this.validateTime()) {
        this.$gapi
          ._libraryInit('client', {
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
            ]
          })
          .then(client => {
            var ev = {
              calendarId: 'primary',
              eventId: this.event.id,
              resource: this.event
            }
            if (this.$refs.adate.classList.contains('noned')) {
              delete this.event.start.date
              delete this.event.end.date
              this.event.start.dateTime = new Date(
                this.event.start.dateTime
              ).toISOString()
              this.event.end.dateTime = new Date(
                this.event.end.dateTime
              ).toISOString()
              return client.calendar.events.update(ev)
            }
            delete this.event.start.dateTime
            delete this.event.end.dateTime
            this.event.start.date = this.event.start.date.substring(0, 10)
            this.event.end.date = this.event.start.date
            return client.calendar.events.update(ev)
          })
          .then(this.toggleEventCard())
          .then(
            setTimeout(function () {
              // TODO Replace logic with vuex no-reload solution
              location.reload()
            }, 1500)
          )
      }
    },
    allDay: function () {
      if (this.$refs.adate.classList.contains('noned')) {
        /* TODO Date to time convert
        if (this.event.start.dateTime) {
          this.event.start.date = this.event.start.dateTime.substring(0, 10)
          this.event.end.date = this.event.end.dateTime.substring(0, 10)
        } */
        this.$refs.adate.classList.remove('noned')
        this.$refs.adbtn.classList.add('actbt')
        this.$refs.sdate.classList.add('noned')
        this.$refs.edate.classList.add('noned')
      } else {
        /* TODO Date to time convert
        if (this.event.start.dateTime === undefined) {
          this.event.start.dateTime = new Date(new Date(this.event.start.date).getTime() - (new Date(this.event.start.date).getTimezoneOffset() * 60000)).toISOString()
          this.event.end.dateTime = new Date(new Date(this.event.end.date).getTime() - (new Date(this.event.end.date).getTimezoneOffset() * 60000)).toISOString()
        } */
        this.$refs.adate.classList.add('noned')
        this.$refs.adbtn.classList.remove('actbt')
        this.$refs.sdate.classList.remove('noned')
        this.$refs.edate.classList.remove('noned')
      }
    }
  },
  props: {
    toggle: Number,
    event: {
      type: Object,
      default: function () {
        return {
          summary: '',
          location: undefined,
          description: undefined,
          colorId: 0,
          start: {
            dateTime: new Date(Date.now()).toISOString()
          },
          end: {
            dateTime: new Date(Date.now()).toISOString()
          }
        }
      }
    }
  },
  watch: {
    toggle: function (update, outdate) {
      if (
        this.$refs.overlay.classList.contains('noned') &&
        update !== undefined
      ) {
        if (this.event.summary !== '') {
          if (
            (this.event.end.dateTime === undefined &&
              !this.$refs.edate.classList.contains('noned')) ||
            (this.event.end.dateTime !== undefined &&
              this.$refs.edate.classList.contains('noned'))
          ) {
            this.allDay()
          }
          if (!this.$refs.edate.classList.contains('noned')) {
            this.event.start.dateTime = new Date(
              new Date(this.event.start.dateTime).getTime() -
                new Date(this.event.start.dateTime).getTimezoneOffset() * 60000
            )
              .toISOString()
              .substring(0, 16)
            this.event.end.dateTime = new Date(
              new Date(this.event.end.dateTime).getTime() -
                new Date(this.event.end.dateTime).getTimezoneOffset() * 60000
            )
              .toISOString()
              .substring(0, 16)
          }
          this.toggleEventCard()
        }
      }
    }
  }
}
</script>

<style scoped>
.bt {
  padding: 0.5rem;
  margin: 0.5rem;
  width: 4rem;
}
section {
  display: block;
  position: fixed;
  width: 100%;
  z-index: 6;
  top: 0;
  bottom: 0;
  padding-top: 10vh;
  overflow-y: scroll hidden;
  transition: all 0.5s;
  background-color: var(--shadow);
}
.page {
  background-color: var(--background);
  border: 1px solid var(--modal);
  box-sizing: border-box;
  max-width: 512px;
  max-height: 600px;
  width: 100%;
  margin: auto;
  padding: 1rem;
  padding-top: 4.5rem;
  border-radius: 6px;
  overflow-y: scroll hidden;
  z-index: 6;
  min-height: min-content;
  transition: all 0.5s;
  overflow-x: hidden;
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow: overlay;
}
.form {
  text-align: center;
  width: 100%;
  max-width: 512px;
  min-width: 300px;
}
.form select {
  all: unset;
}
.form input,
.form textarea,
.form select {
  display: block;
  margin: 1rem;
  padding: 0.6rem 1rem;
  text-align: center;
  margin: 0.8rem auto;
  width: 70%;
  background-color: var(--control);
  border-radius: 6px;
  box-sizing: border-box;
  border: none;
  resize: none;
  color: var(--foreground);
  font-family: inherit;
  font-size: 1.2rem;
}
textarea {
  text-align: left !important;
  height: 6rem;
}
.push {
  padding-top: 100vh;
}
button {
  padding: 0.2rem 0.8rem;
  font-size: 1rem;
}
.ac {
  padding: 0.4rem 0;
  width: calc(50% - 1rem);
}
@media (hover: hover) {
  .abt:hover {
    cursor: pointer;
  }
}
@media screen and (max-width: 670px), screen and (max-height: 660px) {
  section {
    padding: 0;
    background-color: var(--background);
  }
  section * {
    transition-duration: 0;
  }
  .page {
    max-width: initial;
    max-height: max-content;
    height: 100vh;
    top: 0;
    border: none;
    border-radius: 0;
  }
}
</style>
