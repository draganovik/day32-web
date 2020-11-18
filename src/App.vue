<template>
  <div id="app">
    <Login v-if="!this.appAuthState" />
    <section
      v-if="this.appAuthState"
      id="app-interface"
    >
      <AppBar />
      <router-view />
    </section>
  </div>
</template>
<script>
import AppBar from '@/components/AppBar.vue'
import Login from '@/views/Login.vue'
import { mapState, mapMutations } from 'vuex'

export default {
  components: {
    AppBar,
    Login
  },
  methods: {
    ...mapMutations(['SET_AUTH_STATE']),
    setAuthState: function (value) {
      this.SET_AUTH_STATE(value)
    }
  },
  computed: {
    ...mapState(['appAuthState'])
  },
  beforeCreate () {
    this.$gapi.isSignedIn().then((result) => {
      this.setAuthState(result)
    })
  }
}
</script>
<style>
* {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
html,
body,
#app {
  font-family: "Work Sans", sans-serif;
  font-size: 11pt !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: var(--modal);
  color: var(--foreground);
  margin: 0%;
  -webkit-text-size-adjust: none;
  overflow: overlay;
  min-height: 100vh;
}
#app {
  background: url("./assets/login-back-1.png") no-repeat center center;
  background-size: cover;
  height: 100vh;
}
.btn {
  all: initial;
  display: inline-block;
  text-align: center;
  font-family: inherit;
  border-radius: 4px;
  padding: 0.4rem 1.4rem;
  transition-duration: 0.3s;
  background-color: var(--control);
  color: var(--foreground);
  cursor: pointer;
  border: 1px solid var(--shadow) !important;
}
.tag {
  all: initial;
  display: inline-block;
  text-align: center;
  font-family: inherit;
  font-size: 0.8rem;
  height: 1.4rem;
  border-radius: 2rem;
  margin: 0.3rem 0.6rem 0.3rem 0;
  padding: 0.15rem 0.5rem;
  transition-duration: 0.3s;
  background-color: var(--control);
  color: var(--foreground) !important;
  cursor: pointer;
  border: 1px solid var(--control);
}
.tag:active {
  background-color: var(--accent80);
}
#signout_button {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}
@media (hover: hover) {
  .btn:hover {
    background-color: var(--accent80) !important;
    border: 1px solid var(--foreground) !important;
  }
  .tag:hover {
    background-color: var(--active);
  }
}
@media (prefers-color-scheme: light) {
  :root {
    --accent: #5f55b6;
    --accent80: #5f55b6a5;
    --background: #f7f7f7;
    --active: #f0f0f0;
    --foreground: #202020;
    --modal: #f1f1f1;
    --shadow: #13131360;
    --dropshadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.3);
    --control: #e4e4e4;
  }
  .cdark {
    font-size: 0.84rem !important;
    display: block;
    margin: auto;
    margin-top: 1rem;
    line-height: 1.1rem;
  }
}
@media (prefers-color-scheme: dark) {
  :root {
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
  .cdark {
    display: none;
  }
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
.form {
  text-align: center;
  width: 100%;
  max-width: 512px;
  min-width: 300px;
}
.form select {
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
#btn-action {
  user-select: none;
  position: fixed;
  bottom: 6vh;
  right: 4vw;
  border-radius: 2rem;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
  box-sizing: border-box;
  transition-duration: 0.3s;
  text-align: center;
  font-size: 1rem;
  line-height: 1.8rem;
  background-color: var(--accent);
  color: white;
  z-index: 3;
}
.btn-danger {
  color: red !important;
  border-color: red !important;
}
#btn-action:active {
  border-color: var(--accent) !important;
}
.ac {
  padding: 0.4rem 0;
  width: calc(50% - 1rem);
}
@media (hover: hover) {
  #btn-action:hover {
    cursor: pointer;
    background-color: var(--accent) !important;
  }
}
</style>
