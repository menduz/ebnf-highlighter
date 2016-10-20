export const name = "Expressions";
export const grammar = `
{ ws=explicit }
Document 
    ::= (WS* Expression WS* ';'?)* EOF {pin=1, ws=implicit}

Expression 
    ::= (ParenthesisExpression | UnaryExpression | BinaryExpression | SingleExpression) {pin=1, ws=implicit}
UnaryExpression         
    ::= WS* UnaryOperator WS+ Expression {pin=2}
BinaryExpression        
    ::= WS* ExpressionWithoutBinary WS+ BinaryOperator WS+ Expression{fragment=true,pin=1}
ParenthesisExpression   
    ::= '(' Expression ')' {ws=implicit,pin=1,fragment=true}

ExpressionWithoutBinary 
    ::= (UnaryExpression | ParenthesisExpression | SingleExpression) {pin=1, ws=implicit,fragment=true}

BinaryOperator ::= 'map' | 'groupBy' | 'and' | 'or' | '~=' | '!=' | '==' | '>=' | '<=' | '>' | '<' | '^=' | '+' | '-' | '*' | '/'
UnaryOperator  ::= "sizeOf" | "upper" | "lower" | "typeOf"

Literal ::= String | Number {ws=implicit}

SingleExpression ::= ParenthesisExpression | Literal | Identifier {ws=implicit, fragment=true}

Identifier  ::= ('$$' | '$' | [A-Za-z_])([A-Za-z0-9_]|'.')*

Number      ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? {pin=2}
String      ::= '"' CHAR* '"'

Comment     ::= '#' (![#x0A#x0D] [#x00-#xFFFF])* EOL

CHAR        ::= (!'"' [#x20-#xFFFF] | '\"')
WS          ::= Comment | [#x20#x09#x0A#x0D]+ {fragment=true}
EOL         ::= [#x0A#x0D]+|EOF
/* EOF */
`;

export const css = ``;

export const example = `
# https://github.com/mulesoft/data-weave/issues/68

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
`;