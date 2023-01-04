<style lang="stylus" scoped>
@require '../styles/constants.styl'

.teams-list
  margin 0
  padding 0
  list-style none
  .team
    background var(--color)
    width 100%
    padding 20px
    cursor pointer
    transition all 0.2s ease
    text-transform capitalize
    &:hover
      color white
      filter brightness(0.5)
</style>

<template>
  <h1 class="header">Выбор команды</h1>
  <ul class="teams-list">
    <li v-for="team in teams" class="team" :style="{'--color': team.color}" @click="chooseTeam(team)">
      {{ team.name }} <span v-if="team.count">Людей: {{ team.count }}</span>
    </li>
  </ul>
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
    }
  }
}
</script>

