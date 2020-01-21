<template>
  <section>
    <nav ref="navSlide" class="slide">
      <div>
        <div class="user-card">
          <img ref="userImage" alt="User Image" :src="userImage" />
          <label ref="userName">{{ userName }}</label>
        </div>
        <hr style="margin:0" />
        <br />
        <h2>About</h2>
        <p class="about">
          This web application is made using pure VueJS JavaScript framework
          to access Google Calendar API via NodeJS package,
          This is a Progressive Web Application with dark/light mode and
          adaptive icon on supported platforms...
        </p>
        <a class="clean-a" href="mailto:mladen@draganovik.com">mladen@draganovik.com</a>
        <!--
        <ul class="nav-section-links">

          <router-link to="/" v-on:click.native="toggleNavigation()">
            <ion-icon name="calendar"></ion-icon>
            <label>Events</label>
          </router-link>
          <router-link to="/explore" v-on:click.native="toggleNavigation()">
            <ion-icon name="compass"></ion-icon>
            <label>Explore</label>
          </router-link>
        </ul>
        -->
        <br />
      </div>
      <div class="footer">
        <button id="signout_button" class="btn" @click="signout">Sign out</button>
        <br />
        <br />
        <button class="btn cdark" @click="setScheme">Manual dark mode</button>
        <br />
        <br />
        <footer>
          <a class="clean-a" href="https://draganovik.com">Day32 Version {{this.version}}</a>
          <br />
          <br />
          <a href="https://draganovik.com">© 2020 Mladen D. All rights reserved.</a>
        </footer>
      </div>
    </nav>
    <div class="nav-overlay hide noned" ref="navOverlay" v-on:click="toggleNavigation()"></div>
    <header>
      <button v-on:click="toggleNavigation()" class="app-hamburger">
        <label>☰</label>
      </button>
      <label class="app-title">{{ this.locationTitle }}</label>
    </header>
  </section>
</template>

<style>
.nav-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: var(--shadow);
  transition: all 0.7s;
  z-index: 5;
}
nav {
  position: fixed;
  display: block;
  background-color: var(--modal);
  height: 100%;
  min-width: 180px;
  max-width: 300px;
  width: 80%;
  border-radius: 0 4px 4px 0;
  transition: all 0.6s;
  z-index: 6;
}
.user-card {
  position: relative;
  text-align: left;
  padding: 1.2rem;
}
.user-card img {
  width: 3rem;
  margin-top: 0.3rem;
  border-radius: 1.5rem;
}
.user-card label {
  position: absolute;
  top: 50%;
  padding-left: 1rem;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-weight: 600;
}
.nav-section-links {
  text-align: left;
  list-style-type: none;
  padding: 0;
  margin-top: 0;
  width: 100%;
}
.nav-section-links a {
  box-sizing: border-box;
  position: relative;
  width: 95%;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  color: inherit;
  text-decoration: none;
  display: list-item;
  transition-duration: 0.4s;
  border-radius: 0 2rem 2rem 0;
  font-weight: 500;
  font-size: 1.1rem;
}
.nav-section-links a.router-link-exact-active {
  background-color: var(--control);
  color: var(--accent);
}
.nav-section-links a.router-link-exact-active label {
  color: inherit;
  color: var(--foreground);
}
.nav-section-links ion-icon {
  padding-top: 0.3rem;
  height: 1.6rem;
  width: 1.6rem;
}
.nav-section-links label {
  margin: 0 0 0 1rem;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
header {
  background-color: transparent;
  box-sizing: border-box;
  text-align: left;
  width: 100%;
  z-index: 2;
  padding: 1.6rem 1.2rem;
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
}
header * {
  margin: 0.4rem;
}
.app-hamburger {
  all: initial;
  display: block;
  text-align: center;
  font-size: 1.5rem;
  border-radius: 4px;
  transition-duration: 0.3s;
}
.app-hamburger * {
  padding: 0 0.6rem;
  padding-bottom: 0.25rem;
  display: block;
  color: var(--foreground) !important;
}
.app-hamburger:active {
  background-color: var(--accent80);
}
.app-title {
  font-size: 1.6rem;
  font-weight: 600;
}
.hide {
  opacity: 0;
}
.noned {
  display: none !important;
}
.slide {
  transform: translateX(-300px);
}
.sing-out {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}
.footer {
  position: absolute;
  text-align: center;
  bottom: 1rem;
  width: 100%;
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
  margin: 2rem;
}
.dark-scheme {
  --accent: #5f55b6;
  --accent80: #5f55b6a5;
  --background: #202020;
  --active: #202020da;
  --foreground: #f7f7f7;
  --modal: black;
  --shadow: #53535340;
  --dropshadow: 0px 1px 6px 0px rgba(187, 187, 187, 0.2);
  --control: #333333;
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
  footer *:hover {
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
      version: localStorage.getItem('version'),
      locationTitle: 'Events',
      userImage: 0,
      userName: 'User Name'
    }
  },
  created: async function () {
    this.$gapi.currentUser().then(user => {
      if (user) {
        this.userName = user.name
        this.userImage = user.image
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
      this.locationTitle = this.createTitle()
      var overlay = this.$refs.navOverlay
      var nav = this.$refs.navSlide
      if (
        nav.classList.contains('slide') &&
        overlay.classList.contains('noned')
      ) {
        overlay.classList.remove('noned')
        overlay.classList.remove('hide')
        nav.classList.remove('slide')
      } else {
        nav.classList.add('slide')
        overlay.classList.add('hide')
        setTimeout(function () {
          overlay.classList.add('noned')
        }, 600)
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
      var app = document.getElementById('app')
      if (localStorage.getItem('customDark') !== '1') {
        app.classList.add('dark-scheme')
        localStorage.setItem('customDark', '1')
      } else {
        app.classList.remove('dark-scheme')
        localStorage.setItem('customDark', '0')
      }
    }
  },
  mounted () {
    this.locationTitle = this.createTitle()
    var app = document.getElementById('app')
    if (localStorage.getItem('customDark') === '1') {
      app.classList.add('dark-scheme')
    } else {
      app.classList.remove('dark-scheme')
    }
  }
}
</script>
