export const App = {
  render() {
    // ui
    return h('div', 'hi,'+this.msg)
  }

  setup() {
    // 逻辑
    return {
      msg: 'mini-vue'
    }
  }
}