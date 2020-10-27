<template>
  <section
    id="app-login-screen"
    ref="login"
  >
    <div class="login-content">
      <br>
      <img
        alt="App logo"
        src="../assets/logo.png"
      >
      <br>
      <br>
      <h1 style="margin-bottom:0">
        Your personal calendar
      </h1>
      <h3>The way it's meant to be!</h3>
      <br>
      <button
        class="g-signin"
        ref="abtn"
        id="authorize_button"
        @click="signin"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="20px"
          height="20px"
          viewBox="0 0 48 48"
          style="display:block"
        >
          <g>
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path
              fill="none"
              d="M0 0h48v48H0z"
            />
          </g>
        </svg>
        <label for="svg">Sign in</label>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  methods: {
    signin: function () {
      this.$gapi
        .signIn()
        .then(user => {
          console.log('Signed in as %s', user.name)
          location.reload()
        })
        .catch(err => {
          console.error('Not signed in: %s', err.error)
        })
    }
  }
}
</script>

<style scoped>
#app-login-screen {
  background-color: inherit;
  display: flex;
  align-items: center;
  justify-content: stretch;
  flex-direction: column;
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 10;
  text-align: center;
  padding: 3rem;
  box-sizing: border-box;
  background-image: url("../assets/login-back-1.png");
  background-size: cover;
  background-repeat: no-repeat;
  color: var(--foreground);
}
.login-content {
  position: absolute;
  top: 45%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
h3 {
  margin-top: 0.4rem;
}
img {
  height: 10rem;
}
.abcRioButtonIcon {
  padding: 9px !important;
}
.g-signin {
  all: none;
  width: 120px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  border: none;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  transition-duration: 0.2s;
  padding: 6px 8px;
  margin: auto;
}
.g-signin:hover {
  cursor: pointer;
  background-color: #f0f0f0;
}
.g-signin *:hover {
  cursor: pointer;
}
.g-signin * {
  float: left;
  margin: auto;
  margin-left: 0;
  font-weight: 600;
  font-size: 0.85rem;
  color: #757575;
}
</style>
