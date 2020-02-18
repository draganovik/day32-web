<template>
  <div id="app">
    <Login v-if="!this.isSignedIn"></Login>
    <section v-if="this.isSignedIn" id="app-interface">
      <AppBar></AppBar>
      <router-view />
    </section>
  </div>
</template>
<script>
// @ is an alias to /src
import AppBar from '@/components/AppBar.vue'
import Login from '@/views/Login.vue'

export default {
  components: {
    AppBar,
    Login
  },
  data: function () {
    return {
      isSignedIn: localStorage.getItem('isSignedIn')
    }
  },
  created: async function () {
    localStorage.setItem('version', '1.0.10218.1000')
    this.$gapi.isSignedIn().then(result => {
      localStorage.setItem('isSignedIn', result)
      this.isSignedIn = result
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
  font-family: "Nunito", "Avenir", sans-serif;
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
  background-image: url("./assets/login-back-1.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
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
    font-size: 0.8rem !important;
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
    display: none !important;
    font-size: 0.8rem !important;
  }
}
.btn {
  all: initial;
  display: inline-block;
  text-align: center;
  font-family: inherit;
  border-radius: 3rem;
  padding: 0.6rem 1.2rem;
  transition-duration: 0.3s;
  background-color: var(--control);
  color: var(--foreground);
  cursor: pointer;
  border: 1px solid var(--shadow) !important;
}
.btn:active {
  background-color: var(--accent80);
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
    background-color: var(--control);
    border: 1px solid var(--control) !important;
  }
  .tag:hover {
    background-color: var(--active);
  }
}
</style>
