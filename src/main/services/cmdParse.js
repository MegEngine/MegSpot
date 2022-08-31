import parseArgs from 'minimist'
console.log('process.argv', process.argv)
const cmdArg = parseArgs(process.argv.slice(1), {
  alias: {
    h: ['help'],
    i: ['image'],
    v: ['video'],
    c: ['clear']
  }
})
export { cmdArg }
