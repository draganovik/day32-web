<template>
  <section>
    <section ref="overlay" class="overlay noned push" v-on:click="toggleNavigation()">
      <div id="user-modal" class="modal-page">
        <div>
          <div class="user-card">
            <label ref="userName">Hello {{ user.name }}!</label>
          </div>
          <hr />
          <br />
          <h2>Day32</h2>
          <p class="about">
            This web application is made using pure VueJS JavaScript framework to
            access Google Calendar API via NodeJS package, This is a Progressive
            Web Application with dark/light mode and adaptive icon on supported
            platforms...
          </p>
          <a class="clean-a" href="mailto:mladen@draganovik.com">mladen@draganovik.com</a>
          <div class="theme-n-log">
            <button id="signout_button" class="btn" @click.stop="signout">Sign out</button>
            <button class="btn cdark" @click.stop="setScheme">Toggle dark mode</button>
          </div>
        </div>
        <footer>
          <p class="clean-a">Version {{ version }}</p>
          <a href="https://draganovik.com">© 2020 Mladen D. All rights reserved.</a>
        </footer>
      </div>
    </section>
    <div class="nav-overlay hide noned" ref="navOverlay" v-on:click="toggleNavigation()"></div>
    <header>
      <label class="app-title">{{ this.locationTitle }}</label>
      <button v-on:click="toggleNavigation()" class="app-hamburger">
        <img ref="userImage" :src="user.imageURL" />
      </button>
    </header>
  </section>
</template>

<style>
#user-modal {
  padding-top: 2rem;
  height: 32rem;
  position: relative !important;
}
.theme-n-log {
  margin-top: 2rem;
}
.user-card {
  position: relative;
  text-align: center;
  padding: 0.4rem;
}
.user-card label {
  font-weight: 600;
}
header {
  background-color: transparent;
  box-sizing: border-box;
  text-align: left;
  width: 100%;
  z-index: 2;
  padding: 2rem 1.2rem 0.5rem 1.2rem;
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  max-width: 600px;
  margin: auto;
}
header * {
  margin: 0.4rem;
}
.app-hamburger {
  all: initial;
  display: block;
  text-align: center;
  border-radius: 50%;
  transition-duration: 0.3s;
}
.app-hamburger img {
  border-radius: 50%;
  width: 2.4rem;
  height: 2.4rem;
  background-color: whitesmoke;
}
.app-hamburger * {
  display: block;
  color: var(--foreground) !important;
}
.app-hamburger:active {
  background-color: var(--accent80);
}
.app-title {
  font-size: 1.65rem;
  font-weight: 600;
}
.hide {
  opacity: 0;
}
.noned {
  display: none !important;
}
.sing-out {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}
footer {
  position: absolute;
  bottom: 2rem;
}
footer * {
  text-decoration: none;
  color: var(--foreground);
}
.clean-a {
  font-size: 0.9rem;
  color: var(--foreground);
  cursor: pointer;
}
.about {
  text-align: justify;
  margin: 1rem;
}
@media (hover: hover) {
  .nav-section-links a:hover {
    font-weight: 500;
    cursor: pointer;
    background-color: #c5c5c540;
  }
  .nav-section-links a:hover label {
    cursor: pointer;
  }
  .app-hamburger *:hover {
    cursor: pointer;
  }
  .app-hamburger:hover {
    background-color: var(--control);
  }
  .sing-out:hover {
    opacity: 0.8;
  }
  footer a:hover {
    text-decoration: underline var(--accent);
    color: var(--accent);
    cursor: pointer;
  }
}
</style>
<script>
export default {
  data: function () {
    return {
      locationTitle: 'Events',
      version: localStorage.getItem('version')
    }
  },
  computed: {
    user () {
      return this.$store.state.appUser
    }
  },
  created: async function () {
    this.$gapi.currentUser().then(user => {
      if (user) {
        this.$store.commit('LOAD_USER_DATA', user)
      } else {
        console.log('No user is connected.')
      }
    })
  },
  methods: {
    signout: function () {
      this.$gapi.signOut().then(() => {
        console.log('User disconnected.')
        location.reload()
      })
    },
    toggleNavigation: function () {
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
    createTitle: function () {
      if (
        window.location.pathname === '/notes' ||
        window.location.pathname === '/'
      ) {
        return 'Events'
      } else {
        return (
          window.location.pathname.substring(1, 2).toUpperCase() +
          window.location.pathname.substring(2).toLowerCase()
        )
      }
    },
    setScheme: function () {
      if (localStorage.getItem('customDark') !== '1') {
        document.body.classList.add('dark-scheme')
        localStorage.setItem('customDark', '1')
      } else {
        document.body.classList.remove('dark-scheme')
        localStorage.setItem('customDark', '0')
      }
    }
  },
  mounted () {
    this.locationTitle = this.createTitle()
    if (localStorage.getItem('customDark') === '1') {
      document.body.classList.add('dark-scheme')
    } else {
      document.body.classList.remove('dark-scheme')
    }
  }
}
</script>
