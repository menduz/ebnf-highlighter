let monaco;

import React, { Component } from 'react';
import './App.css';
import * as ebnf from 'ebnf';
import examples from './Examples';
import MonacoEditor from 'react-monaco-editor';
import {LineMapper} from './LineMapper';

let parser = null;
const keepUpperRules = false;

function createParser(grammar) {
  return new ebnf.Grammars.Custom.Parser(grammar, { keepUpperRules });
}

let decorations = [];
let editor = null;

function findTokens(token, acumulator, lm) {

  if (lm && monaco) {
    let startLine = lm.position(token.start);
    let endLine = lm.position(token.end);
    token.range = new monaco.Selection(
      startLine.line + 1,
      startLine.column + 1,
      endLine.line + 1,
      endLine.column + 1,
    );
  }

  if (token.children && token.children.length) {
    token.children.forEach(token => findTokens(token, acumulator, lm));
  } else acumulator.push(token);
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

class App extends Component {

  parse() {
    if (this.state.parser) {
      try {
        let ast = this.state.parser.getAST(this.state.selectedExample.example);

        if (ast.rest && ast.rest.length) {
          ast.children.push({
            type: 'SyntaxError',
            start: this.state.selectedExample.example.length - ast.rest.length,
            end: this.state.selectedExample.example.length,
            text: ast.rest,
            children: [],
            parent: ast
          })
        }

        let lm = new LineMapper(this.state.selectedExample.example, "");

        let tokens = [];

        findTokens(ast, tokens, lm);

        this.setState({ ast });



        try {
          if (!monaco) return;

          let newDecorations = [];


          tokens.forEach(token => {
            newDecorations.push({
              options: {
                stickiness: monaco.editor.TrackedRangeStickiness.GrowsOnlyWhenTypingAfter,
                // linesDecorationsClassName: 'myInlineDecoration ' + token.type,
                inlineClassName: (token.type != 'SyntaxError' ? token.type.toLowerCase() : null),
                className: 'myInlineDecoration ' + (token.type == 'SyntaxError' ? 'redsquiggly' : token.type.toLowerCase()),
                hoverMessage: token.type + ' ' + token.text,
                overviewRuler: token.type == 'SyntaxError' ? {
                  position: monaco.editor.OverviewRulerLane.Center,
                  color: "#FF0000",
                  darkColor: "#FF0000"
                } : null
              },
              range: token.range
            });
          });

          decorations = editor && editor.getModel().deltaDecorations(decorations, newDecorations);
        } catch (e) {
          console.log(e);
        }
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

  selectExample({ target }) {
    this.state.selectedExample = examples[target.value];
    this.setState({ selectedExample: examples[target.value], text: examples[target.value].text, parserOk: false, parser: null });
    this.refreshParser();
  }


  codeEditorDidMount(_editor, _monaco) {
    console.log({ _editor, _monaco });
    editor = _editor;

    if (!monaco) {
      monaco = _monaco;


    }

    this.parse();
  }

  grammarEditorDidMount(editor, monaco) {

  }

  editorWillMount(monaco) {
    monaco.languages.register({
      id: 'ebnf'
    });
    monaco.languages.setMonarchTokensProvider('ebnf', require('./Monarch').data);
    console.log(require('./Monarch').data)
  }

  handleChangeExample(txt, evt) {
    if (this.state.selectedExample == examples[0])
      localStorage.setItem('__example', txt);

    this.state.selectedExample.example = txt;
    this.state.text = txt;

    this.parse();
    this.setState({ selectedExample: this.state.selectedExample, text: this.state.text });
  }

  handleChangeGrammar(txt, evt) {
    if (this.state.selectedExample == examples[0])
      localStorage.setItem('__grammar', txt);

    this.state.selectedExample.grammar = txt;
    this.setState({ selectedExample: this.state.selectedExample });
    setTimeout(() => {
      this.setState({ selectedExample: this.state.selectedExample });
      this.refreshParser()
    });
  }

  refreshParser() {
    try {
      parser = this.state.parser = createParser(this.state.selectedExample.grammar);
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

  state = { selectedExample: examples[0], parser: (() => {
    try {
      return (parser = createParser(examples[0].grammar, { keepUpperRules }))
    } catch(e) {
    
    }
  })(), parserOk: true };

  componentDidMount() {
    try {
      this.parse();
    } catch (e) {

    }
  }

  constructor() {
    super();
    this.parse = debounce(this.parse.bind(this), 300);
  }

  render() {

    const options = {
      selectOnLineNumbers: true,
      automaticLayout: true
    };


    return (

      <div className="App">
        <style>
          {`
            .monaco-editor	.selectionHighlight { border: 1px dotted #f38518; box-sizing: border-box; }
            .monaco-editor .hoverHighlight {
              background: rgba(173, 214, 255, 0.3);
              border: 1px dotted #f38518;
              box-sizing: border-box;
            }
            .monaco-editor.vs .view-overlays .selected-text {
              background: #bbbbbb;
            }
          `}
        </style>
        <div className="header">
          POC of <a href="https://github.com/menduz/node-ebnf">node-ebnf</a>.Please select an example:
          <select onChange={this.selectExample.bind(this) }>
            {
              examples.map((e, i) =>
                <option data-type="number" value={i.toString() }>{e.name || 'Restored session'}</option>
              )
            }
          </select>
        </div>

        <div className="column">
          <span>EBNF {this.state.parserOk === true ? <b style={{ color: 'green' }}>OK</b> : <b style={{ color: 'red' }}>{this.state.parserOk}</b>}</span>

          <MonacoEditor
            className="editor"
            width="calc(100% - 2px)"
            height="100%"
            language="ebnf"
            value={this.state.selectedExample.grammar}
            options={options}
            onChange={this.handleChangeGrammar.bind(this) }
            editorDidMount={this.grammarEditorDidMount.bind(this) }
            editorWillMount={this.editorWillMount.bind(this) }
            />
        </div>
        <div className="column">
          <span>Test code</span>

          <MonacoEditor
            width="calc(100% - 2px)"
            height="100%"
            language="custom"
            value={this.state.selectedExample.example}
            options={options}
            onChange={this.handleChangeExample.bind(this) }
            editorDidMount={this.codeEditorDidMount.bind(this) }
            />
        </div>
        <div className="column">
          <span>AST (Hover to highlight) </span>
          <pre>{printAST(this.state.ast, 1, this) }</pre>
        </div>
      </div>
    );
  }

  hoverArea(node) {
    if (node.start == node.end) return;
    let a = this.state.selectedExample.example;
    editor && editor.setSelection(node.range)
  }
}


function printAST(astNode, level = 1, component) {
  if (!astNode) {
    return <b>AST Could not be parsed, please review your code</b>;
  }

  const click = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    component.hoverArea(astNode);
  }

  return <div onMouseEnter={click} onClick={click} className='ast-node'>
    <b style={{ color: astNode.type == 'SyntaxError' || astNode.errors && astNode.errors.length ? 'red' : '#444' }}>{astNode.type}</b>
    {
      (
        !astNode.children || astNode.children.length == 0 ? ' Text=' + astNode.text.replace(/(\n|\r)/g, ' ') : astNode.children.map(x => printAST(x, level + 1, component))
      )
    }{
      (astNode.errors && astNode.errors.length && astNode.errors.map(x => (<div>{x.toString() }</div>)) || '')
    }
  </div>
}

export default App;
