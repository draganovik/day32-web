<template>
  <div>
    <button class="btn" id="btn-action" v-on:click="toggleEventCard()">+ New activity</button>
    <section ref="overlay" class="overlay noned push" v-on:click="toggleEventCard()">
      <div class="modal-page" ref="page" v-on:click.stop>
        <div class="form">
          <input type="text" placeholder="Title" v-model="title" ref="finput" tabindex="1" />
          <input
            type="button"
            class="btn"
            style="width:70%;box-sizing:border-box;"
            ref="adbtn"
            v-on:click="allDay()"
            value="Set without time"
            tabindex="-1"
          />
          <input type="datetime-local" ref="sdate" v-model="startdate" tabindex="2" />
          <input type="datetime-local" ref="edate" class="tdate" v-model="enddate" tabindex="3" />
          <input type="date" ref="adate" class="noned" v-model="date" tabindex="4" />
          <input type="text" placeholder="Location" v-model="location" tabindex="5" />
          <select name="color" id="clr" v-model="colorid" tabindex="6">
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
            v-model="desc"
            tabindex="7"
          ></textarea>
          <div style="display:flex; justify-content: space-between; width:70%; margin: auto">
            <button class="btn ac" v-on:click="toggleEventCard()">Discard</button>
            <button
              class="btn ac"
              v-on:click="addEvent()"
              tabindex="8"
              style="background-color: var(--accent); color: white"
            >Add</button>
          </div>
          <br />
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
        this.setDates()
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
    addEvent: function () {
      if (
        this.title !== '' &&
        ((new Date(this.startdate) > Date.now() &&
          new Date(this.startdate) < new Date(this.enddate)) ||
          new Date(this.date) >= Date.now())
      ) {
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
          this.$store.commit('ADD_EVENT', [this.$gapi, a])
          this.toggleEventCard()
        } else {
          this.$store.commit('ADD_EVENT', [this.$gapi, b])
          this.toggleEventCard()
        }
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
    },
    setDates: function () {
      this.startdate = new Date(
        new Date(Date.now()).getTime() -
          new Date(Date.now()).getTimezoneOffset() * 60000
      )
        .toISOString()
        .substring(0, 16)
      this.date = this.startdate.substring(0, 10)
      this.enddate = this.startdate
    }
  },
  data () {
    return {
      startdate: new Date(Date.now()).toISOString().substring(0, 16),
      enddate: new Date(Date.now()).toISOString().substring(0, 16),
      date: new Date(Date.now()).toISOString().substring(0, 10),
      title: '',
      location: undefined,
      desc: undefined,
      colorid: 1
    }
  }
}
</script>

<style>
.overlay {
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
.modal-page {
  background-color: var(--background);
  border: 1px solid var(--accent80);
  box-sizing: border-box;
  max-width: 512px;
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
.modal-page .form {
  text-align: center;
  width: 100%;
  max-width: 512px;
  min-width: 300px;
}
.modal-page .form select {
  all: unset;
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
  background-position: calc(100% - 1.35rem) calc(1.15rem),
    calc(100% - 1rem) calc(1.15rem);
  background-size: 0.35rem 0.35rem, 0.35rem 0.35rem, 0.2rem 1.5em;
  background-repeat: no-repeat;
}
.modal-page .form input,
.modal-page .form textarea,
.modal-page .form select {
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
.modal-page textarea {
  text-align: left !important;
  height: 6rem;
}
.push {
  padding-top: 100vh;
}
#btn-action {
  user-select: none;
  position: fixed;
  bottom: 6vh;
  right: 4vw;
  border-radius: 2rem;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
  box-sizing: border-box;
  transition-duration: 0.2s;
  text-align: center;
  font-size: 1rem;
  line-height: 1.8rem;
  background-color: var(--accent);
  color: white;
  z-index: 3;
}
#btn-action:active {
  border-color: var(--accent) !important;
}
.modal-page .ac {
  padding: 0.4rem 0;
  width: calc(50% - 1rem);
}
@media (hover: hover) {
  #btn-action:hover {
    cursor: pointer;
    background-color: var(--accent) !important;
  }
}
@media screen and (max-width: 670px), screen and (max-height: 660px) {
  .overlay {
    padding: 0;
    background-color: var(--background);
  }
  .overlay * {
    transition-duration: 0;
  }
  .modal-page {
    max-width: initial;
    max-height: initial;
    height: 100vh;
    top: 0;
    border: none;
    border-radius: 0;
  }
}
</style>
