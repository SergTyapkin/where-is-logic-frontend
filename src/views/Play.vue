<style lang="stylus" scoped>
@require '../styles/constants.styl'
@require '../styles/buttons.styl'

.answer-button
  button-green()

.teams-list
  margin 0
  padding 0
  list-style none
  display flex
  flex-wrap wrap
  .team
    background var(--color)
    flex 1
    padding 20px
    transition all 0.2s ease
    text-transform capitalize
</style>

<template>
  <Countdown :duration="2000" :progress="2000" ref="countdownButton" bar-color="gray" class="countdown-button"></Countdown>
  <div class="answer-button" @click="answer">Ответить</div>
  <div>{{ infoText }}</div>
  <div v-if="answeringTeam">
    <div>Отвечает команда: {{ answeringTeam.name }}</div>
    <Countdown :duration="5000" :progress="5000" ref="countdown" :bar-color="answeringTeam.color" class="countdown"></Countdown>
  </div>
  <ul class="teams-list">
    <li v-for="team in teams" class="team" :style="{'--color': team.color}">
      {{ team.name }} <span v-if="team.count">Людей: {{ team.count }}</span>
    </li>
  </ul>
</template>

<script>
import Countdown from "../components/Countdown.vue";
import {Teams} from "../utils/constants";

export default {
  components: {Countdown},
  data() {
    return {
      teams: [],
      answeringTeam: undefined,

      myTeamId: undefined,
      myTeamName: undefined,
      myName: undefined,

      isTeamAnswering: undefined,
      infoText: '',
    }
  },

  mounted() {
    // --- load from localStorage
    this.myTeamId = this.$localStorage.loadSelectedTeam();
    if (this.myTeamId === null) {
      this.$popups.error("Ошибка", "Номера команды нет в localStorage");
      this.$router.push({name: "chooseTeam"});
      return;
    }
    this.myTeamName = Teams.find((team) => team.id == this.myTeamId).name;

    this.myName = this.$localStorage.loadUserName();
    if (this.myName === null) {
      this.$popups.error("Ошибка", "Имени пользователя нет в localStorage");
      this.$router.push({name: "chooseRole"});
      return;
    }

    // --- get teams from WS
    this.$ws.send('get_teams_count', {});
    this.$ws.handlers.teams_count = (data) => {
      this.teams = data.teams;
      this.teams.forEach((dataTeam) => {
        const team = Teams.find((team) => team.id == dataTeam.id);
        dataTeam.color = team.color;
      });
    }
    this.$ws.handlers.player_connected = (data) => {
      const thisTeam = this.teams.find((team) => team.id == data.teamId);
      if (thisTeam !== undefined) {
        thisTeam.count += 1;
        return;
      }
      // add new team
      const constTeam = Teams.find((team) => team.id == data.teamId);
      this.teams.push({
        id: constTeam.id,
        name: constTeam.name,
        color: constTeam.color,
        count: 1,
      });
    }

    // --- setup playing process
    this.$ws.handlers.team_answered = (data) => {
      this.isTeamAnswering = true;

      const team = Teams.find((team) => team.id == data.teamId);
      if (team === undefined)
        return;

      this.answeringTeam = {
        id: team.id,
        name: team.name,
        color: team.color,
      }

      this.$refs.countdown.setProgress(0);
    }
    this.$ws.handlers.answer_rated = (data) => {
      this.isTeamAnswering = false;
      this.answeringTeam = null;

      if (data.result) {
        this.infoText = "Правильно!";
      }
    }
  },

  methods: {
    answer() {
      if (this.isTeamAnswering || !this.$refs.countdownButton.isFinished)
        return;
      this.$refs.countdownButton.setProgress(0);

      this.$ws.send('answer', {
        userName: this.myName,
        teamId: this.myTeamId,
        teamName: this.myTeamName,
      })
    }
  }
}
</script>

