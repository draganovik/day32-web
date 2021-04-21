<template>
  <div>
    <About ref="about" />
    <header>
      <label class="app-title">{{ this.locationTitle }}</label>
      <button
        @click="toggleAbout()"
        class="app-hamburger"
      >
        <img
          ref="userImage"
          :src="user.imageURL"
        >
      </button>
    </header>
  </div>
</template>

<script>
import About from '@/components/ModalAbout.vue'
export default {
  components: {
    About
  },
  data: function () {
    return {
      locationTitle: 'Events'
    }
  },
  computed: {
    user () {
      return this.$store.state.appUser
    }
  },
  created: async function () {
    this.$gapi.currentUser().then((user) => {
      if (user) {
        this.$store.commit('setLocalUserData', user)
      } else {
        console.log('No user is connected.')
      }
    })
  },
  methods: {
    toggleAbout: function () {
      this.$refs.about.toggleModal()
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

<style scoped>
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
}
</style>
