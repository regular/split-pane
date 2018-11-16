window.setImmediate = f => setTimeout(f, 0)
const h = require('mutant/html-element')
const setStyle = require('module-styles')('split-pane-demo')

setStyle(`
  body {
    height: 500px;
  }
  .pane {
    background: khaki;
  }
`)

const {makeSplitPane, makePane, makeDivider} = require('.')

let paneA, paneB, panceC, paneD, paneE

document.body.appendChild(
  makeSplitPane({horiz: false}, [
    paneA = makePane('30%', [
      h('h1', 'This is pane A')
    ]),
    makeDivider(),
    makeSplitPane({horiz: true}, [
      paneB = makePane('70%', [
        h('h1', 'This is pane B')
      ]),
      makeDivider(),
      paneC = makePane('20%', [
        h('h1', 'This is pane C')
      ]),
      makeDivider(),
      paneD = makePane('10%', [
        h('h1', 'This is pane D')
      ])
    ]),
    makeDivider(),
    paneE = makePane('30px', [
      h('h1', 'This is pane E')
    ])
  ])
)

