<style lang="stylus" scoped>
@require '../styles/constants.styl'
@require '../styles/buttons.styl'

.buttons
  display flex
  gap 20px
  .answer-ok-button
    button-green()
  .answer-deny-button
    button-red()

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
  <div>{{ infoText }}</div>
  <div v-if="answeringTeam">
    <div>Отвечает команда: {{ answeringTeam.name }}</div>
    <Countdown :duration="5000" :progress="5000" ref="countdown" :bar-color="answeringTeam.color" class="countdown"></Countdown>
    <div class="buttons">
      <div class="answer-ok-button" @click="answerRate(true)">Правильно</div>
      <div class="answer-deny-button" @click="answerRate(false)">Не правильно</div>
    </div>
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
    answerRate(result) {
      if (!this.isTeamAnswering)
        return;

      this.$ws.send('answer_result', {
        result: result,
      });
    }
  }
}
</script>

