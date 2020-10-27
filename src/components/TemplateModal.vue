<template>
  <section
    class="noned"
    ref="modal"
    @click="toggleModal()"
  >
    <div
      class="overlay2 noned hide"
      ref="overlay"
    />
    <div
      class="content noned push hide"
      ref="content"
      @click.stop
    >
      <button
        class="btn btn-exit"
        @click="toggleModal()"
      >
        x
      </button>
      <slot />
    </div>
  </section>
</template>

<script>
export default {
  name: 'Modal',
  methods: {
    toggleModal: function () {
      var modal = this.$refs.modal
      var content = this.$refs.content
      var overlay = this.$refs.overlay
      if (
        content.classList.contains('push') &&
        content.classList.contains('noned')
      ) {
        modal.classList.remove('noned')
        overlay.classList.remove('noned')
        content.classList.remove('noned')
        content.classList.remove('hide')
        overlay.classList.remove('hide')
        setTimeout(function () {
          content.classList.remove('push')
        }, 1)
      } else {
        content.classList.add('push')
        setTimeout(function () {
          content.classList.add('hide')
          overlay.classList.add('hide')
          setTimeout(function () {
            content.classList.add('noned')
            overlay.classList.add('noned')
            modal.classList.add('noned')
          }, 200)
        }, 100)
      }
    }
  }
}
</script>

<style scoped>
section {
  display: flex;
  position: fixed;
  width: 100%;
  min-height: 100vh;
  z-index: 6;
  top: 0;
  bottom: 0;
  overflow-y: scroll hidden;
  transition: all 0.5s;
}
.overlay2 {
  position: absolute;
  background-color: var(--shadow);
  width: 100%;
  min-height: 100vh;
}
.btn-exit {
  font-size: 0.9em;
  padding: 0.4rem 0.7rem;
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
}
.content {
  position: relative;
  background-color: var(--background);
  border: 1px solid var(--accent80);
  box-sizing: border-box;
  max-width: 512px;
  width: 100%;
  margin: auto;
  padding: 1rem;
  padding-top: 2rem;
  border-radius: 6px;
  overflow-y: scroll hidden;
  z-index: 6;
  min-height: min-content;
  transition: all 0.5s;
  overflow-x: hidden;
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow: overlay;
}
.push {
  transform: translate(0, 100vh);
}
.hide {
  opacity: 0 !important;
}
.noned {
  display: none !important;
}
@media screen and (max-width: 670px), screen and (max-height: 660px) {
  section {
    padding: 0;
    background-color: var(--background);
  }
  section * {
    transition-duration: 0;
  }
  .content {
    max-width: initial;
    max-height: initial;
    height: 100vh;
    top: 0;
    border: none;
    border-radius: 0;
  }
}
</style>
