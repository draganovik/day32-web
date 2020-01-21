<template>
  <div>
    <button class="abt" v-on:click="toggleEventCard()">Add new activity</button>
    <section ref="overlay" class="noned push">
      <div class="page" ref="page">
        <form action>
          <input type="text" placeholder="Title" autofocus v-model="title" />
          <input
            type="button"
            class="btn"
            style="width:70%;box-sizing:border-box;"
            ref="adbtn"
            v-on:click="allDay()"
            value="All day event"
          />
          <input type="datetime-local" ref="sdate" v-model="startdate" />
          <input type="datetime-local" ref="edate" class="tdate" v-model="enddate" />
          <input type="date" ref="adate" class="noned" v-model="date" />
          <input type="text" placeholder="Location" v-model="location" />
          <select name="color" id="clr" v-model="colorid">
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
          <textarea name="desc" rows="8" cols="4" placeholder="Description" v-model="desc"></textarea>
        </form>
        <br />
        <div style="display:flex;justify-content: space-between;width:70%;margin:auto">
          <button class="btn ac" v-on:click="toggleEventCard()">Discard</button>
          <button class="btn ac" v-on:click="addEvent()">Save</button>
        </div>
      </div>
    </section>
  </div>
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
        setTimeout(function () {
          overlay.classList.remove('hide')
          setTimeout(function () {
            overlay.classList.remove('push')
          }, 200)
        }, 200)
      } else {
        overlay.classList.add('push')
        setTimeout(function () {
          overlay.classList.add('hide')
          setTimeout(function () {
            overlay.classList.add('noned')
          }, 200)
        }, 400)
      }
    },
    addEvent: function () {
      if (
        this.title !== '' &&
        ((new Date(this.startdate) > Date.now() &&
          new Date(this.startdate) < new Date(this.enddate)) ||
          new Date(this.date) >= Date.now())
      ) {
        this.$gapi
          ._libraryInit('client', {
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
            ]
          })
          .then(client => {
            var a = {
              calendarId: 'primary',
              resource: {
                summary: this.title,
                location: this.location,
                description: this.desc,
                colorId: this.colorid,
                start: {
                  dateTime: new Date(this.startdate)
                },
                end: {
                  dateTime: new Date(this.enddate)
                }
              }
            }
            var b = {
              calendarId: 'primary',
              resource: {
                summary: this.title,
                location: this.location,
                description: this.desc,
                colorId: this.colorid,
                start: {
                  date: this.date
                },
                end: {
                  date: this.date
                }
              }
            }
            if (this.$refs.adate.classList.contains('noned')) {
              return client.calendar.events.insert(a)
            }
            return client.calendar.events.insert(b)
          })
          .then(this.toggleEventCard())
          .then(
            setTimeout(function () {
              location.reload()
            }, 1500)
          )
      }
    },
    allDay: function () {
      if (this.$refs.adate.classList.contains('noned')) {
        this.$refs.adate.classList.remove('noned')
        this.$refs.adbtn.classList.add('actbt')
        this.$refs.sdate.classList.add('noned')
        this.$refs.edate.classList.add('noned')
      } else {
        this.$refs.adate.classList.add('noned')
        this.$refs.adbtn.classList.remove('actbt')
        this.$refs.sdate.classList.remove('noned')
        this.$refs.edate.classList.remove('noned')
      }
    }
  },
  data () {
    return {
      startdate: new Date(Date.now()).toISOString().substring(0, 16),
      enddate: new Date(Date.now()).toISOString().substring(0, 16),
      date: new Date(Date.now()).toISOString().substring(0, 10),
      title: '',
      location: '',
      desc: '',
      colorid: 1
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
  width: 100%;
  margin: auto;
  padding: 1rem;
  padding-top: 3rem;
  border-radius: 6px;
  overflow-y: scroll hidden;
  z-index: 6;
  height: 84vh;
  min-height: 300px;
  transition: all 0.5s;
  overflow-x: hidden;
  text-align: center;
}
form {
  text-align: center;
}
form input,
form textarea,
form select {
  display: block;
  margin: 1rem;
  padding: 0.4rem;
  text-align: center;
  margin: 0.8rem auto;
  width: 70%;
  background-color: var(--modal);
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
.actbt {
  background-color: var(--accent80) !important;
}
.abt {
  all: unset;
  user-select: none;
  position: fixed;
  bottom: 2.8rem;
  right: 2rem;
  background-color: var(--accent);
  color: white;
  font-weight: 600;
  padding: 1rem;
  border-radius: 1.75rem;
  -webkit-box-shadow: var(--dropshadow);
  -moz-box-shadow: var(--dropshadow);
  box-shadow: var(--dropshadow);
  box-sizing: border-box;
  transition-duration: 0.2s;
  min-width: 3rem;
  font-size: 1rem;
  text-align: center;
  z-index: 3;
}
.abt:active {
  font-size: 0.96rem;
  bottom: 2.82rem;
  right: 2.02rem;
}
button {
  padding: 0.2rem 0.8rem;
  font-size: 1rem;
}
.ac {
  padding: 0.4rem 1rem;
}
@media (hover: hover) {
  .abt:hover {
    cursor: pointer;
  }
}
@media screen and (max-width: 670px), screen and (max-height: 660px) {
  section {
    padding: 0;
  }
  .page {
    max-width: initial;
    height: 100vh;
    top: 0;
    border: none;
    border-radius: 0;
  }
}
</style>
