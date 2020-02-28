import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)
const Storage = new VuexPersistence({
  key: 'Application Logic'
})

localStorage.setItem('version', '1.1.2002.2806')

export const store = new Vuex.Store({
  state: {
    appTheme: 'system',
    appVersion: '1.1.2002.2806',
    appAuthState: true,
    appUser: {
      name: 0,
      imageURL: 0
    },
    appEventColors: {
      default: 'initial',
      levander: '#c7c7ed',
      sage: '#33b679',
      grape: '#8e24aa',
      flamingo: '#e67c73',
      banana: '#f6c026',
      tangerine: '#f5511d',
      peacock: '#039be5',
      graphite: '#616161',
      blueberry: '#3f51b5',
      basil: '#0b8043',
      tomato: '#d60000'
    },
    googleApiConfig: {
      apiKey: 'AIzaSyBqCP-xgWzm2y5gsk90cl-APUL39FgVrP4',
      clientId:
        '834050956628-9khmjoh5efp45b9flvk8joiqdvee110i.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/calendar'
    },
    googleCalendars: {
      primary: ''
    }
  },
  getters: {
    GET_GOOGLE_CALENDARS: state => gapi => {
      gapi
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
          store.commit('SET_EVENTS', response.result.items)
        })
    }
  },
  mutations: {
    SET_AUTH_STATE: (state, value) => {
      state.appAuthState = value
    },
    LOAD_USER_DATA: (state, user) => {
      state.appUser.name = user.name
      state.appUser.imageURL = user.image
    },
    SET_EVENTS: (state, events) => {
      state.googleCalendars.primary = events
    },
    ADD_EVENT: (state, [gapi, event]) => {
      gapi
        ._libraryInit('client', {
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
          ]
        })
        .then(client => {
          return client.calendar.events.insert(event)
        })
      state.googleCalendars.primary.pop()
      state.googleCalendars.primary.push(event.resource)
      state.googleCalendars.primary.sort((a, b) => {
        if (
          new Date(
            a.start.date !== undefined ? a.start.date : a.start.dateTime
          ).getTime() <
          new Date(
            b.start.date !== undefined ? b.start.date : b.start.dateTime
          ).getTime()
        ) {
          return -1
        } else return 1
      })
    }
  },
  actions: {},
  modules: {},
  plugins: [Storage.plugin]
})
