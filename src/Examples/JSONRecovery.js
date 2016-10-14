export const name = "JSON (With error recovery)";
export const grammar = `
{ ws=implicit }
/* JSON WITH ERROR RECOVERY https://www.ietf.org/rfc/rfc4627.txt */
value                ::= false | null | true | object | number | string | array
BEGIN_ARRAY          ::= #x5B /* [ left square bracket */
BEGIN_OBJECT         ::= #x7B /* { left curly bracket */
END_ARRAY            ::= #x5D /* ] right square bracket */
END_OBJECT           ::= #x7D /* } right curly bracket */
NAME_SEPARATOR       ::= #x3A /* : colon */
VALUE_SEPARATOR      ::= #x2C /* , comma */
WS                   ::= [#x20#x09#x0A#x0D]+   /* Space | Tab | \n | \r */
false                ::= "false"
null                 ::= "null"
true                 ::= "true"
object               ::= BEGIN_OBJECT object_content? END_OBJECT { pin=1 }
object_content       ::= (member (object_n)*) { recoverUntil=OBJECT_RECOVERY }
object_n             ::= VALUE_SEPARATOR member { recoverUntil=OBJECT_RECOVERY,fragment=true }
Key                  ::= &'"' string { recoverUntil=VALUE_SEPARATOR, pin=1 }
OBJECT_RECOVERY      ::= END_OBJECT | VALUE_SEPARATOR
ARRAY_RECOVERY       ::= END_ARRAY | VALUE_SEPARATOR
MEMBER_RECOVERY      ::= '"' | NAME_SEPARATOR | OBJECT_RECOVERY | VALUE_SEPARATOR
member               ::= Key NAME_SEPARATOR value { recoverUntil=MEMBER_RECOVERY, pin=2 }
array                ::= BEGIN_ARRAY array_content? END_ARRAY { pin=1 }
array_content        ::= array_value (VALUE_SEPARATOR array_value)* { recoverUntil=ARRAY_RECOVERY,fragment=true }
array_value          ::= value { recoverUntil=ARRAY_RECOVERY, fragment=true }

number               ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? { pin=2, ws=explicit }

/* STRINGS */

string                ::= ~'"' (([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG))* '"' { ws=explicit }
HEXDIG                ::= [a-fA-F0-9] { ws=explicit }
`;

export const css = `

`;

export const example = `{
  "name": "ebnf-highlighter",
  "version": "0.1.0",
  "private": true,
  EROOOOOOOOOOOOOOOO0000000000000000000OOOOOOR,
  "homepage": "http://menduz.com/ebnf-highlighter",
  "devDependencies": {
    "react-scripts": "0.6.1"
  },
  "dependencies": {
    "ebnf": "^1.2.0",
    EROOOOOOOOOOOOOOOO0000000000000000000OOOOOOR,
    "react": "^15.3.2",
    "react-dom": "^15.3.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "(rm -fr docs || true) && react-scripts build && mv build docs",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}`;