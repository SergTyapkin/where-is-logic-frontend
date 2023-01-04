<style lang="stylus" scoped>
@require './styles/constants.styl'

.wrapper
  width 100%
  min-height 100vh

  > *
    position absolute
    width 100%
  .loading
    top 50%
    left 50%
    transform translate(-50%, -50%)
    width 100px
    height 100px


backgroundBorderColor = colorBg
animation-time-rule = cubic-bezier(0.29, 0.82, 0.36, 0.99)
.background
  z-index -1
  position fixed
  inset 0
  overflow hidden
  div
    opacity 0.3
    width 100%
    position absolute
    border solid 1px colorBorder
    background black
    border-radius 20px
    animation bg-move-top animation-time-rule
    @keyframes bg-move-top
      0%
        opacity 0
        top 0
        height 200%
        width 200%
      20%
        top 0
        height 200%
        width 200%
  div:nth-child(2n)
    animation bg-move-bottom animation-time-rule
    @keyframes bg-move-bottom
      0%
        opacity 0
        top 100%
        height 200%
        width 200%
      20%
        top 100%
        height 200%
        width 200%

  div:nth-child(4)
    animation bg-move-top-scale animation-time-rule
    @keyframes bg-move-top-scale
      0%
        opacity 0
        top 100%
        height 0%
        width 200%
      20%
        top 0%
        height 0%
        width 200%
  div:nth-child(1)
    top 50%
    left 50%
    height 100%
    width 100%
    transform rotate(70deg)
    animation-duration 0.3s
  div:nth-child(2)
    top 0%
    left 20%
    height 200%
    width 100%
    transform rotate(40deg)
    animation-duration 1.2s
  div:nth-child(3)
    top -40%
    left -50%
    height 100%
    width 100%
    transform rotate(20deg)
    animation-duration 0.6s
  div:nth-child(4)
    top -15%
    left 20%
    height 100%
    width 200%
    transform rotate(30deg)
    animation-duration 0.8s
  div:nth-child(5)
    top 90%
    left 30%
    height 100%
    width 100%
    transform rotate(20deg)
    animation-duration 1s
</style>

<template>
  <div class="background">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>

  <div class="wrapper _app-flex-root">
    <CircleLoading v-if="!websocketOpened" class="loading"></CircleLoading>
    <router-view v-else v-slot="{ Component }">
      <transition :name="transitionName">
        <component :is="Component" class="main"/>
      </transition>
    </router-view>
  </div>

  <Modal ref="modal"></Modal>
  <ModalCalculator ref="modalCalculator"></ModalCalculator>
  <Popups ref="popups"></Popups>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s ease;
}
.slide-left-enter-to {
  left: 0;
}
.slide-left-enter-from {
  left: -100%;
}
.slide-left-leave-to {
  left: -100%;
  transform: scale(0.8);
}
.slide-left-leave-from {
  left: 0;
}


.scale-slide-left-enter-active,
.scale-slide-left-leave-active {
  transition: all 0.3s ease;
}
.scale-slide-left-enter-from {
  left: -30%;
  opacity: 0;
}
.scale-slide-left-enter-to {
  left: 0%;
  opacity: 1;
}
.scale-slide-left-leave-from {
  transform: scale(1);
}
.scale-slide-left-leave-to {
  transform: scale(0.8);
  opacity: 0;
}


.scale-in-enter-active,
.scale-in-leave-active {
  transition: all 0.3s ease;
}
.scale-in-enter-from {
  transform: scale(1.2);
  opacity: 0;
}
.scale-in-enter-to {
  transform: scale(1);
  opacity: 1;
}
.scale-in-leave-from {
  transform: scale(1);
  opacity: 1;
}
.scale-in-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>

<script>
import {getCurrentInstance} from "vue";
import Modal from "/src/components/vue-plugins/Modal.vue";
import ModalCalculator from "/src/components/vue-plugins/ModalCalculator.vue";
import Popups from "/src/components/vue-plugins/Popups.vue";
import CircleLoading from "/src/components/CircleLoading.vue";
import WS from "./utils/ws";
import {EventTypes, Roles} from "./utils/constants";
import LocalStorageManager from "./utils/localStorageManager";


export default {
  components: {CircleLoading, Modal, Popups, ModalCalculator},

  data() {
    return {
      transitionName: "",
      websocketOpened: false,

      savedEvent: undefined,
    }
  },

  watch: {
    $route(to, from) {
      this.transitionName = 'scale-in';

      console.log(from.path, 'TO', to.path)

      // if (to.path === '/profile')
      //   this.transitionName = 'scale-slide-left';
      // else if (from.path === '/profile')
      //   this.transitionName = 'scale-slide-right';
      //
      // else if (from.path === '/signin' && to.path === '/signup')
      //   this.transitionName = 'slide-left';
      // else if (from.path === '/signup' && to.path === '/signin')
      //   this.transitionName = 'slide-left';
    }
  },

  mounted() {
    const global = getCurrentInstance().appContext.config.globalProperties;

    global.$modal = this.$refs.modal;
    global.$modalCalculator = this.$refs.modalCalculator;
    global.$popups = this.$refs.popups;
    global.$app = this;
    global.$localStorage = new LocalStorageManager();

    // ------ Setup basic WS handlers --------
    this.$ws.onopen = () => {this.websocketOpened = true};
    this.$ws.onerror = () => {
      this.$popups.error('Ошибка подключения:', 'Сервер недоступен');
    }
    this.$ws.open();

    // ------ If user logined - redirect to task page or "wait for task" --------
    const storedRole = this.$localStorage.loadRole();
    if (storedRole === null) {
      this.$router.push({name: 'chooseRole'});
      return;
    }
    if (storedRole === Roles.seer) {
      this.$router.push({name: 'seerPage'});
      return;
    }
    // user - player
    const storedTeam = this.$localStorage.loadSelectedTeam();
    if (storedTeam === null) {
      this.$router.push({name: 'chooseTeam'});
      return;
    }
    // user - player, has team
    this.$router.push({name: 'play'});
  },


  methods: {
  }
};
</script>
