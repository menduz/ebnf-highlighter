import React, { Component } from 'react';
import './App.css';
import * as ebnf from 'ebnf';
import ContentEditable from './ContentEditable';
import examples from './Examples';

const keepUpperRules = false;

function createParser(grammar) {
  return new ebnf.Grammars.W3C.Parser(grammar, { keepUpperRules });
}


class App extends Component {

  parse() {
    if (this.state.parser) {
      this.setState({ ast: this.state.parser.getAST(this.state.selectedExample.example) });
    } else console.error('No parser yet');
  }


  handleChangeExample(evt) {
    this.state.selectedExample.example = evt.target.text;
    this.state.text = evt.target.text;
    this.parse();
    this.setState({ selectedExample: this.state.selectedExample, text: this.state.text });
  }

  handleChangeGrammar(evt) {
    this.state.selectedExample.grammar = evt.target.text;
    this.state.parser = createParser(this.state.selectedExample.grammar);
    this.parse();
    this.setState({ selectedExample: this.state.selectedExample, parser: this.state.parser });
  }

  handleChangeCSS(evt) {
    this.state.selectedExample.css = evt.target.text;
    this.setState({ selectedExample: this.state.selectedExample });
  }

  state = { selectedExample: examples[0], parser: createParser(examples[0].grammar, { keepUpperRules }) };

  componentDidMount() {
    this.parse();
  }

  render() {
    return (
      <div className="App">
        <div className="column">
          <span>EBNF</span>
          <ContentEditable
            tagName='pre'
            className="code"
            html={this.state.selectedExample.grammar}
            disabled={false}
            onChange={this.handleChangeGrammar.bind(this) }
            />
        </div>
        <div className="column">
          <span>Test code</span>
          <ContentEditable
            tagName='pre'
            className="code"
            html={this.state.text || this.state.selectedExample.example}
            disabled={false}
            onChange={this.handleChangeExample.bind(this) }
            />
        </div>
        <div className="">
          <span>AST</span>
          <pre>{printAST(this.state.ast, 1, this) }</pre>
        </div>
        <div className="" style={{display: 'none'}}>
          <span>Css</span>
          <ContentEditable
            tagName='pre'
            className="code"
            html={this.state.selectedExample.css}
            disabled={false}
            onChange={this.handleChangeCSS.bind(this) }
            />
        </div>
      </div>
    );
  }

  hoverArea(start, end){
    if(start == end) return;
    let a = this.state.selectedExample.example;
    this.setState({ text: [a.slice(0, start), '<b class="hovered">', a.slice(start, end), '</b>', a.slice(end)].join('') });
  }
}


function printAST(astNode, level = 1, component) {
  if (!astNode) {
    return <b>AST Could not be parsed, please review your code</b>;
  }
  return <div onMouseEnter={() => component.hoverArea(astNode.start, astNode.end) } className='ast-node'>
    <b>{astNode.type}</b>
    {
      (!astNode.children || astNode.children.length == 0 ? ' Text=' + astNode.text.replace(/(\n|\r)/g, ' ') : astNode.children.map(x => printAST(x, level + 1, component)))
    }
  </div>
}

export default App;
