export const data = {
  tokenPostfix:     '.js',

  keywords: [
    'ws', 'fragment', 'recoverUntil', 'pin'
  ],

  builtins: [
    'define','require','window','document','undefined'
  ],

  operators: [
    '&', '?', '!', '*', '+', '::=', '='
  ],

  // define our own brackets as '<' and '>' do not match in javascript
  brackets: [
    ['(',')','bracket.parenthesis'],
    ['{','}','bracket.curly']
  ],

  // common regular expressions
  symbols:  /[~!@#%\^&*-+=|\\:`<>.?\/]+/,
  escapes:  /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
  exponent: /[eE][\-+]?[0-9]+/,

  regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
  regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,

  tokenizer: {
    root: [
      // identifiers and keywords
      [/([a-zA-Z_\$][\w\$]*)(\s*)(:?)/, {
        cases: { '$1@keywords': ['keyword','white','delimiter'],
                 '$3': ['key.identifier','white','delimiter'],   // followed by :
                 '$1@builtins': ['predefined.identifier','white','delimiter'],
                 '@default': ['identifier','white','delimiter'] } }],

      // whitespace
      { include: '@whitespace' },

      // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
      [/\/(?=([^\\\/]|\\.)+\/)/, { token: 'regexp.slash', bracket: '@open', next: '@regexp'}],

      // delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/(?:[;,.]|::=)/, 'delimiter'],
      [/@symbols/, { cases: {'@operators': 'operator',
                             '@default': '' }}],

      // numbers
      [/#[xX][\da-fA-F]+/, 'number'],

      // strings: recover on non-terminated strings
      [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/'([^'\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/"/,  'string', '@string."' ],
      [/'/,  'string', '@string.\'' ],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/,       'comment', '@comment' ],
      [/\/\/.*$/,    'comment'],
    ],

    comment: [
      [/[^\/*]+/, 'comment' ],
      // [/\/\*/, 'comment', '@push' ],    // nested comment not allowed :-(
      [/\/\*/,    'comment.invalid' ],
      ["\\*/",    'comment', '@pop'  ],
      [/[\/*]/,   'comment' ]
    ],

    string: [
      [/[^\\"']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./,      'string.escape.invalid'],
      [/["']/,     { cases: { '$#==$S2' : { token: 'string', next: '@pop' },
                              '@default': 'string' }} ]
    ],

    // We match regular expression quite precisely
    regexp: [
      [/(\{)(\d+(?:,\d*)?)(\})/, ['@brackets.regexp.escape.control', 'regexp.escape.control', '@brackets.regexp.escape.control'] ],
      [/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ['@brackets.regexp.escape.control',{ token: 'regexp.escape.control', next: '@regexrange'}]],
      [/(\()(\?:|\?=|\?!)/, ['@brackets.regexp.escape.control','regexp.escape.control'] ],
      [/[()]/,        '@brackets.regexp.escape.control'],
      [/@regexpctl/,  'regexp.escape.control'],
      [/[^\\\/]/,     'regexp' ],
      [/@regexpesc/,  'regexp.escape' ],
      [/\\\./,        'regexp.invalid' ],
      ['/',           { token: 'regexp.slash', bracket: '@close'}, '@pop' ],
    ],

    regexrange: [
      [/-/,     'regexp.escape.control'],
      [/\^/,    'regexp.invalid'],
      [/@regexpesc/, 'regexp.escape'],
      [/[^\]]/, 'regexp'],
      [/\]/,    '@brackets.regexp.escape.control', '@pop'],
    ],
  },
}