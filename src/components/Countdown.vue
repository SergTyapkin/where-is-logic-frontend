<style lang="stylus" scoped>
@require '../styles/constants.styl'

width = 100%
barHeight = 4px
borderRadius = barHeight / 2

.root
  --bar_color__ colorSuccess

  width width
  margin-left auto
  margin-right auto
  opacity calc(var(--progress) + 0.2)
  transition opacity 0.2s ease

  .value
    color colorSuccess
    font-small-bold()
    width 100%
    text-align center

  .bar
    background var(--bar_color__) 50% no-repeat
    border-radius borderRadius
    height barHeight
    margin 0 auto
    width calc(var(--progress) * 100%)

.root.disabled
  --bar_color__ colorGrayLight

.root.done
  opacity 0

</style>

<template>
  <div class="root" :class="{disabled, done: isFinished}" :style="{'--progress': displayProgress, '--bar_color__': barColor}">
    <div class="bar"></div>
    <div class="value">{{ displayValue }}</div>
  </div>
</template>

<script>
export default {
  emits: ['done'],

  props: {
    duration: {
      type: Number,
      default: 3000,
    },
    progress: {
      type: Number,
      default: null,
    },
    tps: {
      type: Number,
      default: 60,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    barColor: {
      type: String,
      default: null,
    }
  },

  data() {
    return {
      tickTime: undefined,
      progress: this.$props.progress || 0,
      displayValue: this.duration,
      displayProgress: 0,

      isFinished: false,
      hasTick: false,
    }
  },

  mounted() {
    this.tickTime = 1000 / this.tps;

    if (this.progress >= this.duration) {
      this.isFinished = true;
      return;
    }
    this.startTicking();
  },

  methods: {
    startTicking() {
      if (this.hasTick)
        return;
      this.hasTick = true;

      this.__setTick();
    },

    __setTick() {
      if (this.progress < this.duration) {
        setTimeout(this.__setTick, this.tickTime);
        this.progress += this.tickTime;
      }
      if (this.progress > this.duration && !this.isFinished) {
        this.progress = this.duration;
        this.isFinished = true;
        this.$emit('done');
        this.hasTick = false;
      }

      this.displayValue = Math.ceil((this.duration - this.progress) / 1000);
      this.displayProgress = 1 - (this.progress / this.duration);
    },

    setProgress(progress) {
      this.progress = progress;
      if (progress >= this.duration) {
        this.isFinished = true;
        return;
      }
      this.isFinished = false;
      this.startTicking();
    },
  }
}
</script>

