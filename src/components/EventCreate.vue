<template>
  <div>
    <button
      class="btn"
      id="btn-action"
      @click="toggleModal()"
    >
      + New activity
    </button>
    <Modal ref="modal">
      <div class="form">
        <input
          type="text"
          placeholder="Title"
          v-model="title"
          ref="finput"
          tabindex="1"
        >
        <input
          type="button"
          class="btn"
          style="width: 70%; box-sizing: border-box"
          ref="adbtn"
          @click="allDay()"
          value="Set without time"
          tabindex="-1"
        >
        <input
          type="datetime-local"
          ref="sdate"
          v-model="startdate"
          tabindex="2"
        >
        <input
          type="datetime-local"
          ref="edate"
          class="tdate"
          v-model="enddate"
          tabindex="3"
        >
        <input
          type="date"
          ref="adate"
          class="noned"
          v-model="date"
          tabindex="4"
        >
        <input
          type="text"
          placeholder="Location"
          v-model="location"
          tabindex="5"
        >
        <select
          name="color"
          id="clr"
          v-model="colorid"
          tabindex="6"
        >
          <option value="1">
            Levander
          </option>
          <option value="2">
            Sage
          </option>
          <option value="3">
            Grape
          </option>
          <option value="4">
            Flamingo
          </option>
          <option value="5">
            Banana
          </option>
          <option value="6">
            Tangerine
          </option>
          <option value="7">
            Peacock
          </option>
          <option value="8">
            Graphite
          </option>
          <option value="9">
            Blueberry
          </option>
          <option value="10">
            Basil
          </option>
          <option value="11">
            Tomato
          </option>
        </select>
        <textarea
          name="desc"
          rows="8"
          cols="4"
          placeholder="Description"
          v-model="desc"
          tabindex="7"
        />
        <div
          style="
            display: flex;
            justify-content: space-between;
            width: 70%;
            margin: auto;
          "
        >
          <button
            class="btn ac"
            @click="toggleModal()"
          >
            Discard
          </button>
          <button
            class="btn ac"
            @click="addEvent()"
            tabindex="8"
            style="background-color: var(--accent); color: white"
          >
            Add
          </button>
        </div>
        <br>
      </div>
    </Modal>
  </div>
</template>

<script>
import Modal from '@/components/TemplateModal.vue'
export default {
  components: {
    Modal
  },
  methods: {
    toggleModal: function () {
      this.$refs.modal.toggleModal()
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
          this.toggleModal()
        } else {
          this.$store.commit('ADD_EVENT', [this.$gapi, b])
          this.toggleModal()
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
