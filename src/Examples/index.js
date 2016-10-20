import * as JSON from './JSON'
import * as JSONRecovery from './JSONRecovery'
import * as Brainfuck from './Brainfuck'
import * as Expressions from './Expressions'

let LAST_USED = {
  name: '',
  grammar: localStorage.getItem('__grammar') || JSON.grammar,
  example: localStorage.getItem('__example') || JSON.example
}

export default [
  LAST_USED,
  JSON,
  JSONRecovery,
  Brainfuck,
  Expressions
]