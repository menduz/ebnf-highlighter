export const name = "Expressions";
export const grammar = `

{ ws=explicit }
Document 
    ::= (WS* Expression ([#x20#x09]* EOL | WS* Comment))* EOF {pin=1, ws=implicit}

Expression 
    ::= (UnaryExpression | BinaryExpression | ParenthesisExpression | SingleExpression) {pin=1, ws=implicit, fragment=true}
UnaryExpression         
    ::= WS* UnaryOperator (WS+|&'(') Expression {pin=2}
BinaryExpression        
    ::= WS* ExpressionWithoutBinary WS+ BinaryOperator WS+ Expression{pin=1}
ParenthesisExpression   
    ::= '(' Expression ')' {ws=implicit,pin=1,fragment=true}

ExpressionWithoutBinary 
    ::= (UnaryExpression | ParenthesisExpression | SingleExpression) {pin=1, ws=implicit,fragment=true}

BinaryOperator ::= 'map' | 'filter'| 'groupBy' | 'joinBy' | 'and' | 'or' | '~=' | '!=' | '==' | '>=' | '<=' | '>' | '<' | '^=' | '+' | '-' | '*' | '/'
UnaryOperator  ::= "sizeOf" | "upper" | "lower" | "typeOf"

Literal ::= String | Number {ws=implicit,fragment=true}

SingleExpression ::= ParenthesisExpression | Literal | Identifier {ws=implicit, fragment=true}

Identifier  ::= ('$$' | '$' | [A-Za-z_])([A-Za-z0-9_]|'.')*

Number      ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? {pin=2}
String      ::= '"' (!'"' [#x20-#xFFFF])* '"'

Comment     ::= '#' (![#x0A#x0D] [#x00-#xFFFF])* EOL

WS          ::= Comment | [#x20#x09#x0A#x0D]+ {fragment=true}
EOL         ::= [#x0A#x0D]+|EOF
/* EOF */

`;

export const css = ``;

export const example = `
   payload.a + "asd"
  
  "asd"
  
  payload
  
  upper "Agustin"

  
  sizeOf payload filter $.age > 30
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ unary
#        ^^^^^^^^^^^^^^^^^^^^^^^^^ binary
#                       ^^^^^^^^^^ binary
# IS THE SAME AS
  sizeOf (payload filter $.age > 30)
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ unary
#        ^^^^^^^^^^^^^^^^^^^^^^^^^^^ binary
#                        ^^^^^^^^^^ binary

  payload map (upper($.name joinBy ","))
  # is the same as
  payload map  upper $.name joinBy ","  

  sizeOf a
# ^^^^^^^^ unary

  payload and b
# ^^^^^^^^^^^^^ binary

  sizeOf payload map upper $
# ^^^^^^^^^^^^^^^^^^^^^^^^^^ unary
#        ^^^^^^^^^^^^^^^^^^^ binary
#                    ^^^^^^^ unary

  sizeOf payload map $.a + 10 + sizeOf b
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ unary
#        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ binary
#                    ^^^^^^^^^^^^^^^^^^^ binary
#                          ^^^^^^^^^^^^^ binary
#                               ^^^^^^^^ unary
  (sizeOf payload map ($.a + 10)) + sizeOf b
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ binary
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^            unary
#         ^^^^^^^^^^^^^^^^^^^^^^^            binary
#                     ^^^^^^^^^^             binary
#                                   ^^^^^^^^ unary



`;