export const name = "Brainfuck";
export const grammar = `
program  ::= sentence*
sentence ::= WS* (command | loop) WS* { fragment=true }
command  ::= increment_ptr | decrement_ptr | increment_data | decrement_data | write_data | read_data { fragment=true }
loop     ::= "[" sentence* "]" { pin=1 }

increment_ptr ::= ">"
decrement_ptr ::= "<"

increment_data ::= "+"
decrement_data ::= "-"

write_data ::= "."
read_data ::= ","

WS       ::= [#x20#x09#x0A#x0D]+

`;

export const css = `

`;

export const example = `

-,+[
    -[
        >>++++[>++++++++<-]
        <+<-[
            >+>+>-[>>>]
            <[[>+<-]>>+>]    
            <<<<<-           
        ]                    
    ]>>>[-]+                 
    >--[-[<->+++[-]]]<[      
        ++++++++++++<[       
                             
            >-[>+>>]         
            >[+[<+>-]>+>>]   
            <<<<<-           
        ]                    
        >>[<+>-]             
        >[                   
            -[               
                -<<[-]>>     
            ]<<[<<->>-]>>    
        ]<<[<<+>>-]          
    ]                        
    <[-]                     
    <.[-]                    
    <-,+                     
]                            

`