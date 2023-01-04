<style lang="stylus" scoped>
@require '../styles/fonts.styl'
@require '../styles/constants.styl'
@require '../styles/buttons.styl'

button-size = 90vw
button-max-size = 500px

.root
  display flex
  flex-direction column

.header
  --color colorBlocksBg
  display flex
  align-items center
  width 100%
  margin 0
  background var(--color)
  box-shadow 0 5px 20px var(--color)
  color textColorDark4
  margin-bottom 40px
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

.main
  flex 1
  display flex
  align-items center
  justify-content center
  position relative
  width 100%
  margin 0
  padding 0
  .answer-button
    margin 0 auto
    width button-size
    max-width button-max-size
    height button-size
    max-height button-max-size
    button-big-circle()

  .answering-team
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
    width 100%
    padding 40px
    backdrop-filter blur(20px)
    pointer-events none
    transition opacity 0.2s ease
    .answering-team-text
      color var(--color)
      text-align center
      font-medium()
      font-weight 700
    &.hidden
      opacity 0
      pointer-events none

.footer
  display flex
  flex-wrap wrap
  width 100%
  margin 0
  margin-top 60px
  padding 0
  .team
    width 50%
    background var(--color)
    flex 1
    display flex
    align-items center
    padding 20px
    text-transform capitalize
    justify-content space-between
    .name-container
      .score
        font-large()
      .name
        font-small-extra()
    .count-container
      .profile-img
        width 20px
        height 20px
      .count
        font-medium()
        z-index 1000
</style>

<template>
  <div class="root _app-flex-filler">
    <header class="header" :style="{'--color': myTeam.color}" @click="quit">
      <img class="arrow-back" src="../res/arrow_corner_right.svg" alt="back">
      <div class="name-container">
        <div class="name">{{ myName }}</div>
        <div class="team-name">{{ myTeam.name }}</div>
      </div>
    </header>

    <main class="main">
      <div>
        <div class="answer-button" @click="answer" :disabled="(!$refs.countdownButton?.isFinished) ? true : null">
          <div>Ответить</div>
          <Countdown :duration="2000" :progress="2000" ref="countdownButton" bar-color="gray" class="countdown-button"></Countdown>
        </div>

        <div class="answering-team" :class="{hidden: !answeringTeam}" :style="{'--color': answeringTeam?.color}">
          <div class="answering-team-text">Отвечает команда: {{ answeringTeam?.name }}</div>
          <div class="answering-team-text">Кнопка нажата: {{ answeringTeam?.username }}</div>
          <Countdown :duration="5000" :progress="5000" ref="countdown" :bar-color="answeringTeam?.color" class="countdown"></Countdown>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div v-for="team in teams" class="team" :style="{'--color': team.color}">
        <div class="name-container">
          <div class="score">{{ team.score || 0 }}</div>
          <div class="name">{{ team.name }}</div>
        </div>
        <div class="count-container">
          <img src="../res/profile.svg" alt="" class="profile-img">
          <span class="count">{{ team.count || 0 }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import Countdown from "../components/Countdown.vue";
import {getTeamById} from "../utils/utils";

export default {
  components: {Countdown},
  data() {
    return {
      teams: [],
      answeringTeam: undefined,

      myTeam: {},
      myName: undefined,

      isTeamAnswering: undefined,
      infoText: '',
    }
  },

  mounted() {
    // --- load from localStorage
    const myTeamId = this.$localStorage.loadSelectedTeam();
    if (myTeamId === null) {
      this.$popups.error("Ошибка", "Номера команды нет в localStorage");
      this.$router.push({name: "chooseTeam"});
      return;
    }
    this.myTeam = getTeamById(myTeamId);

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
        const team = getTeamById(dataTeam.id);
        dataTeam.color = team.color;
        dataTeam.score = dataTeam.score || 0;
        dataTeam.count = dataTeam.count || 0;
      });
    }
    this.$ws.handlers.player_connected = (data) => {
      const thisTeam = getTeamById(data.teamId, this.teams);
      if (thisTeam !== undefined) {
        thisTeam.count += 1;
        return;
      }
      // add new team
      const constTeam = getTeamById(data.teamId);
      this.teams.push({
        id: constTeam.id,
        name: constTeam.name,
        color: constTeam.color,
        count: 1,
        score: 0,
      });
    }
    this.$ws.handlers.player_disconnected = (data) => {
      const thisTeam = getTeamById(data.teamId, this.teams);
      if (thisTeam === undefined) {
        return;
      }
      thisTeam.count -= 1;
      if ((thisTeam.score === 0) && (thisTeam.count <= 0)) {
        const idx = this.teams.findIndex((team) => team.id === thisTeam.id);
        this.teams.splice(idx, 1);
      }
    }

    // --- get answering state
    this.$ws.send('get_answering_state', {});
    this.$ws.handlers.answering_state = (data) => {
      if (!data.team)
        return;

      this.isTeamAnswering = true;
      this.answeringTeam = getTeamById(data.team.teamId);
      this.answeringTeam.username = data.team.userName;
    }

    // --- setup playing process
    this.$ws.handlers.team_answered = (data) => {
      this.isTeamAnswering = true;

      const team = getTeamById(data.teamId);
      if (team === undefined)
        return;

      this.answeringTeam = {
        id: team.id,
        name: team.name,
        color: team.color,
        username: data.userName,
      }

      this.$refs.countdown.setProgress(0);
    }
    this.$ws.handlers.answer_rated = (data) => {
      if (data.result === true) {
         const team = getTeamById(this.answeringTeam.id, this.teams);
         if (team === undefined) {
           // add new team
           const constTeam = getTeamById(this.answeringTeam.id);
           this.teams.push({
             id: constTeam.id,
             name: constTeam.name,
             color: constTeam.color,
             count: 0,
             score: 1,
           });
         } else {
           team.score += 1;
         }
      }

      this.isTeamAnswering = false;
      this.answeringTeam = null;
    }
  },

  methods: {
    answer() {
      if (!this.$refs.countdownButton.isFinished)
        return;
      this.$refs.countdownButton.setProgress(0);

      if (this.isTeamAnswering) {
        return;
      }

      this.$ws.send('answer', {
        userName: this.myName,
        teamId: this.myTeam.id,
        teamName: this.myTeam.name,
      })
    },

    quit() {
      this.$localStorage.removeSelectedTeam();
      this.$ws.send("quit_from_team", {
        userName: this.myName,
        teamId: this.myTeam.id,
        teamName: this.myTeam.name,
      });
      this.$router.push({name: "chooseTeam"});
    }
  }
}
</script>

