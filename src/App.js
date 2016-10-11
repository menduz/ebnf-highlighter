import React, { Component } from 'react';
import './App.css';
import * as ebnf from 'ebnf';
import ContentEditable from './ContentEditable';
import examples from './Examples';

const keepUpperRules = false;

function createParser(grammar) {
  return new ebnf.Grammars.Custom.Parser(grammar, { keepUpperRules });
}


class App extends Component {

  parse() {
    if (this.state.parser) {
      try {
        this.setState({ ast: this.state.parser.getAST(this.state.selectedExample.example) });
      } catch (e) {
        this.setState({
          ast: {
            type: 'SyntaxError',
            start: 0,
            end: this.state.selectedExample.example.length,
            text: e.toString()
          }
        });
        console.log(e);
      }
    } else console.error('No parser yet');
  }

  selectExample({ target }){
    this.state.selectedExample = examples[target.value];
    this.setState({ selectedExample: examples[target.value], text: examples[target.value].text, parserOk: false, parser: null });
    this.refreshParser();
  }


  handleChangeExample(evt) {
    this.state.selectedExample.example = evt.target.text;
    this.state.text = evt.target.text;
    this.parse();
    this.setState({ selectedExample: this.state.selectedExample, text: this.state.text });
  }

  handleChangeGrammar(evt) {
    this.state.selectedExample.grammar = evt.target.text;
    this.setState({ selectedExample: this.state.selectedExample });
    this.refreshParser();
  }

  refreshParser(){
    try {
      this.state.parser = createParser(this.state.selectedExample.grammar);
      this.setState({ parser: this.state.parser, parserOk: true });
      this.parse();
    } catch (e) {
      this.setState({ parserOk: e.toString() });
    }
  }

  handleChangeCSS(evt) {
    this.state.selectedExample.css = evt.target.text;
    this.setState({ selectedExample: this.state.selectedExample });
  }

  state = { selectedExample: examples[0], parser: createParser(examples[0].grammar, { keepUpperRules }), parserOk: true };

  componentDidMount() {
    this.parse();
  }

  render() {
    return (
      <div className="App">
        <div style={{fontSize: 11, padding: 10}}>
          POC of <a href="https://github.com/menduz/node-ebnf">node-ebnf</a>. Please select an example: 
          <select onChange={this.selectExample.bind(this)}>
            {
              examples.map((e, i) =>
                <option data-type="number" value={i.toString()}>{e.name}</option>
              )
            }
          </select>
        </div>
        <hr />
        <div className="column">
          <span>EBNF {this.state.parserOk === true ? <b style={{ color: 'green' }}>OK</b> : <b style={{ color: 'red' }}>{this.state.parserOk}</b>}</span>
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
          <span>AST (Hover to highlight)</span>
          <pre>{printAST(this.state.ast, 1, this) }</pre>
        </div>
        <div className="" style={{ display: 'none' }}>
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

  hoverArea(start, end) {
    if (start == end) return;
    let a = this.state.selectedExample.example;
    this.setState({ text: [a.slice(0, start), '<b class="hovered">', a.slice(start, end), '</b>', a.slice(end)].join('') });
  }
}


function printAST(astNode, level = 1, component) {
  if (!astNode) {
    return <b>AST Could not be parsed, please review your code</b>;
  }
  return <div onMouseEnter={() => component.hoverArea(astNode.start, astNode.end) } className='ast-node'>
    <b style={{color: astNode.type == 'SyntaxError' ? 'red':'black'}}>{astNode.type}</b>
    {
      (!astNode.children || astNode.children.length == 0 ? ' Text=' + astNode.text.replace(/(\n|\r)/g, ' ') : astNode.children.map(x => printAST(x, level + 1, component)))
    }
  </div>
}

export default App;
