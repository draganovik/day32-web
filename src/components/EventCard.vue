<template>
  <li ref="card">
    <div class="delete-event" ref="exmark" v-on:click.stop="deleteEvent()">{{ this.exmark }}</div>
    <label>{{ this.item.summary }}</label>
    <div class="tags">
      <button v-for="tg in this.tags" :key="item.id + tg.show()" class="tag">{{ tg.show() }}</button>
    </div>
    <div class="ltr">
      <p>{{ this.getDate() }}</p>
      <b>
        <p>{{ this.getTime() }}</p>
      </b>
    </div>
  </li>
</template>

<script>
export default {
  props: {
    item: Object
  },
  data: function () {
    return {
      tags: [],
      exmark: '!',
      toDelete: false
    }
  },
  methods: {
    getDate: function () {
      var time
      if (this.item.start.dateTime === undefined) {
        time = new Date(this.item.start.date)
      } else {
        time = new Date(this.item.start.dateTime)
      }
      var now = new Date(new Date(Date.now()).toDateString())
      var diff = Math.floor((time - now) / (1000 * 60 * 60 * 24))
      if (diff === 0) {
        return (
          Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(time) +
          ' ' +
          time.getDate() +
          '. (Today)'
        )
      }
      if (diff === 1) {
        return (
          Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(time) +
          ' ' +
          time.getDate() +
          '. (Tomorrow)'
        )
      }
      if (diff < 10 && diff > -1) {
        return (
          Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(time) +
          ' ' +
          time.getDate() +
          '. (In ' +
          diff +
          ' days)'
        )
      } else if (now.getMonth() === time.getMonth()) {
        return (
          Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(time) +
          ' ' +
          time.getDate() +
          '. (In ' +
          diff +
          ' days)'
        )
      } else if (now.getFullYear() === time.getFullYear()) {
        return (
          Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(time) +
          ' ' +
          time.getDate() +
          '. ' +
          Intl.DateTimeFormat('en-US', { month: 'short' }).format(time) +
          '. (In ' +
          diff +
          ' days)'
        )
      }
      return (
        Intl.DateTimeFormat('en-US', { month: 'short' }).format(time) +
        ' ' +
        time.getDate() +
        '. ' +
        time.getFullYear() +
        '. (In ' +
        diff +
        ' days)'
      )
    },
    getTime: function () {
      if (this.item.start.dateTime === undefined) {
        return 'All day'
      }
      var sTime = new Date(this.item.start.dateTime)
      var eTime = new Date(this.item.end.dateTime)
      return (
        (sTime.getHours() < 10 ? '0' + sTime.getHours() : sTime.getHours()) +
        ':' +
        (sTime.getMinutes() < 10
          ? '0' + sTime.getMinutes()
          : sTime.getMinutes()) +
        ' - ' +
        (eTime.getHours() < 10 ? '0' + eTime.getHours() : eTime.getHours()) +
        ':' +
        (eTime.getMinutes() < 10
          ? '0' + eTime.getMinutes()
          : eTime.getMinutes())
      )
    },
    getTags: function () {
      var list = []
      if (this.item.location !== undefined) {
        var obj = {
          key: this.item.location,
          show: function () {
            if (this.key.length > 30) {
              return '📌 ' + this.key.substring(0, 20) + '...'
            } else return '📌 ' + this.key
          }
        }
        list.push(obj)
      }
      if (this.item.attendees !== undefined) {
        this.item.attendees.forEach(element => {
          if (!element.self) {
            var obj = {
              key: element.email,
              show: function () {
                if (element.displayName !== undefined) {
                  return '🤝 ' + element.displayName
                } else {
                  return '🤝 ' + element.email
                }
              }
            }
            list.push(obj)
          }
        })
      }
      if (this.item.description !== undefined) {
        obj = {
          key: this.item.description,
          show: function () {
            if (this.key.length > 40) {
              return '📝 ' + this.key.substring(0, 38) + '...'
            } else return '📝 ' + this.key
          }
        }
        list.push(obj)
      }
      return list
    },
    setColor: function () {
      var card = this.$refs.card
      switch (this.item.colorId) {
        case '1':
          card.classList.add('levander')
          break
        case '2':
          card.classList.add('sage')
          break
        case '3':
          card.classList.add('grape')
          break
        case '4':
          card.classList.add('flamingo')
          break
        case '5':
          card.classList.add('banana')
          break
        case '6':
          card.classList.add('tangerine')
          break
        case '7':
          card.classList.add('peacock')
          break
        case '8':
          card.classList.add('graphite')
          break
        case '9':
          card.classList.add('blueberry')
          break
        case '10':
          card.classList.add('basil')
          break
        case '11':
          card.classList.add('tomato')
          break
        default:
          card.classList.add('colored')
          break
      }
    },
    deleteEvent: function () {
      if (!this.toDelete) {
        this.exmark = 'Delete event'
        setTimeout(function () {
          location.reload()
        }, 800)
        this.toDelete = true
      } else {
        this.exmark = 'Deleting...'
        this.$gapi.request({
          path:
            'https://www.googleapis.com/calendar/v3/calendars/primary/events/' +
            this.item.id,
          method: 'DELETE'
        })
      }
    }
  },
  mounted () {
    this.tags = this.getTags()
    this.setColor()
  }
}
</script>

<style scoped>
li {
  list-style: none;
  display: block;
  position: relative;
  z-index: 0;
  background-color: var(--background);
  border-radius: 6px;
  overflow: auto;
  box-sizing: border-box;
  margin: 0.5rem auto;
  max-width: 512px;
  min-width: 300px;
  padding: 0.6rem 0.8rem;
  text-align: left;
  transition-duration: 0.4s;
  border: 1px solid;
  border-top-color: var(--control) !important;
  border-bottom-color: var(--control) !important;
  border-right-color: var(--control) !important;
  border-left: 0.3rem solid transparent;
}
.ltr {
  display: flex;
  justify-content: space-between;
}
label {
  cursor: text;
  font-weight: 600;
  font-size: 1.4rem;
}
.delete-event {
  border: 1px solid var(--control);
  display: block;
  position: absolute;
  font-size: 1rem;
  padding: 0.2rem 0.8rem;
  right: 0.64rem;
  top: 0.64rem;
  color: var(--control);
  border-radius: 4px;
}
p {
  padding: 0;
  margin: 0;
}
.tags {
  padding: 0.6rem 0;
  margin: 0;
}
.levander {
  border-color: rgb(208, 208, 235);
}
.sage {
  border-color: #33b679;
}
.grape {
  border-color: #8e24aa;
}
.flamingo {
  border-color: #e67c73;
}
.banana {
  border-color: #f6c026;
}
.tangerine {
  border-color: #f5511d;
}
.peacock {
  border-color: #039be5;
}
.graphite {
  border-color: #616161;
}
.blueberry {
  border-color: #3f51b5;
}
.basil {
  border-color: #0b8043;
}
.tomato {
  border-color: #d60000;
}
.colored {
  border-color: var(--control) !important;
}
@media (hover: hover) {
  li:hover {
    border-color: var(--foreground) !important;
    cursor: pointer;
  }
  .delete-event:hover {
    background-color: var(--accent80);
    color: var(--foreground);
    border-color: var(--foreground);
  }
}
</style>
