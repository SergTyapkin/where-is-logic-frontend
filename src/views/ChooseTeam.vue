<style lang="stylus" scoped>
@require '../styles/constants.styl'

.root
  display flex
  flex-direction column
  overflow-y auto

  .header
    --color colorBlocksBg
    display flex
    align-items center
    width 100%
    background var(--color)
    box-shadow 0 5px 20px var(--color)
    color textColor1
    padding 10px
    filter brightness(0.8)
    transition filter 0.2s ease
    cursor pointer
    &:hover
      filter brightness(1)
    .arrow-back
      transform rotate(180deg)
      width 60px
      height 60px
    .name-container
      white-space nowrap
      .name
        font-medium()
      .team-name
        font-small()

  .h1
    font-large()
    margin 20px
  .team
    opacity 0.6
    flex 1
    display flex
    align-items center
    font-medium()
    color textColorDark4
    font-weight 600
    background var(--color)
    width 100%
    padding 20px
    cursor pointer
    transition all 0.2s ease
    text-transform capitalize
    .profile-img
      width 20px
      height 20px
      margin-left 20px
    &:hover
      color white
      filter brightness(0.8)
      opacity 1
</style>

<template>
  <div class="root _app-flex-filler">
    <header class="header" @click="quit">
      <img class="arrow-back" src="../res/arrow_corner_right.svg" alt="back">
      <div class="name-container">
        <div class="name">{{ myName }}</div>
      </div>
    </header>

    <div class="h1">Выбор команды</div>
    <div v-for="team in teams" class="team" :style="{'--color': team.color}" @click="chooseTeam(team)">
      {{ team.name }}
      <span v-if="team.count !== undefined">
        <img src="../res/profile.svg" class="profile-img" alt="users">
        {{ team.count || 0 }}
      </span>
    </div>
  </div>
</template>

<script>
import {Teams} from "../utils/constants";
import {deepClone} from "../utils/utils";

export default {
  data() {
    return {
      teams: deepClone(Teams),

      myName: undefined,
    }
  },

  mounted() {
    // --- load from localStorage
    this.myName = this.$localStorage.loadUserName();
    if (this.myName === null) {
      this.$popups.error("Ошибка", "Имени пользователя нет в localStorage");
      this.$router.push({name: "chooseRole"});
      return;
    }

    // --- get teams from WS
    this.$ws.handlers.teams_count = (data) => {
      data.teams.forEach((team) => {
        this.teams.find((thisTeam) => {
          if (thisTeam.id === team.id)
            thisTeam.count = team.count;
        });
      });

      this.teams.sort((a, b) => {return b.count - a.count})
    }
    this.$ws.send('get_teams_count', {});
  },

  methods: {
    chooseTeam(team) {
      this.$ws.send('join_to_team', {
        userName: this.myName,
        teamId: team.id,
        teamName: team.name
      });
      this.$localStorage.saveSelectedTeam(team.id);
      this.$router.push({name: 'play'});
    },

    quit() {
      this.$localStorage.removeRole();
      this.$localStorage.removeUserName();
      this.$router.push({name: "chooseRole"});
    }
  }
}
</script>

