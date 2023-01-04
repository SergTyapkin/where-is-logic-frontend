<style lang="stylus" scoped>
@require '../styles/constants.styl'
@require '../styles/buttons.styl'

.button-player
  button-green()
.button-seer
  button-gray()
</style>

<template>
  <h1 class="header">Выберите роль</h1>
  <div class="button-player" @click="selectRole(roles.player)">Я буду играть</div>
  <div class="button-seer" @click="selectRole(roles.seer)">Я буду только наблюдать</div>
</template>

<script>
import {Roles} from "../utils/constants";


export default {
  data() {
    return {
      roles: Roles,
    }
  },

  mounted() {
  },

  methods: {
    async selectRole(role) {
      if (role === Roles.player) {
        const username = await this.$modal.prompt("Введите ваше имя");
        if (!username)
          return;
        this.$localStorage.saveUserName(username);
        this.$localStorage.saveRole(role);
        this.$router.push({name: 'chooseTeam'});
        return;
      }
      // seer
      this.$localStorage.saveRole(role);
      this.$router.push({name: 'seerPage'});
    }
  }
}
</script>

