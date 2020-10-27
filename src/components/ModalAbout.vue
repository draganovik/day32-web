<template>
  <Modal ref="modal">
    <div>
      <h2>Day32</h2>
      <p class="about">
        This web application is made using pure VueJS JavaScript framework to
        access Google Calendar API via NodeJS package, This is a Progressive Web
        Application with dark/light mode and adaptive icon on supported
        platforms...
      </p>
      <a
        class="clean-a"
        href="mailto:mladen@draganovik.com"
      >mladen@draganovik.com</a>
      <div class="theme-n-log">
        <button
          id="signout_button"
          class="btn"
          @click.stop="signout"
        >
          Sign out
        </button>
        <button
          class="btn cdark"
          @click.stop="setScheme"
        >
          Toggle dark mode
        </button>
      </div>
    </div>
    <footer>
      <p class="clean-a">
        Version {{ version }}
      </p>
      <a
        href="https://draganovik.com"
      >© 2020 Mladen Draganović. All rights reserved.</a>
    </footer>
  </Modal>
</template>

<script>
import Modal from '@/components/TemplateModal.vue'
export default {
  components: {
    Modal
  },
  computed: {
    user () {
      return this.$store.state.appUser
    }
  },
  data: function () {
    return {
      version: localStorage.getItem('version')
    }
  },
  methods: {
    signout: function () {
      this.$gapi.signOut().then(() => {
        console.log('User disconnected.')
        location.reload()
      })
    },
    toggleModal: function () {
      this.$refs.modal.toggleModal()
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
  }
}
</script>

<style>
.sing-out {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}
footer * {
  text-decoration: none;
  color: var(--foreground);
}
.clean-a {
  font-size: 0.9rem;
  color: var(--foreground);
}
.about {
  text-align: justify;
  margin: 1rem;
}
.theme-n-log {
  margin: 1rem;
}
@media (hover: hover) {
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
