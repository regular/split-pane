window.setImmediate = function(f) {
  setTimeout(f, 0)
}
const h = require('mutant/html-element')

document.body.style.height = '500px'

document.body.appendChild(h('style', `
  .horizontal-split-pane > .divider {
    cursor: col-resize
  }
  .vertical-split-pane > .divider {
    cursor: row-resize
  }
`))

let paneA, paneB, panceC, paneD, paneE

document.body.appendChild(
  makeSplitPane(false, [
    paneA = makePane('30%'),
    makeDivider(),
    makeSplitPane(true, [
      paneB = makePane('70%'),
      makeDivider(),
      paneC = makePane('20%'),
      makeDivider(),
      paneD = makePane('10%')
    ]),
    makeDivider(),
    paneE = makePane('30px')
  ])
)

paneA.appendChild(h('h1', 'This is pane A'))
paneB.appendChild(h('h1', 'This is pane B'))
paneC.appendChild(h('h1', 'This is pane C'))
paneD.appendChild(h('h1', 'This is pane D'))
paneE.appendChild(h('h1', 'This is pane E'))

function makeSplitPane(horiz, children) {
  return h(`div.${horiz ? 'horizontal' : 'vertical'}-split-pane`, {
    style: {
      display: 'flex',
      'flex-direction': horiz ? 'row' : 'column',
      'flex-grow': 1,
      'flex-shrink': 1,
      'box-sizing': 'border-box',
      width: '100%',
      height: '100%'
    }
  }, children)
}

function totalDividerSize(parent) {
  return [].slice(parent.children).reduce((acc, e) => {
    if (!e.classList.contains('divider')) return acc
    const bb = e.getBoundingClientRect()
    acc.width += bb.width
    acc.height += bb.height
    return acc
  }, {width: 0, height: 0})
}

function setFlexBasis(e, delta, origPx, totalPx) {
  const fb = e.style['flex-basis']
  const newPx = origPx + delta
  e.style['flex-basis' ] = fb.includes('%') ?
    `${newPx * 100 / totalPx}%` : `${newPx}px`
}

function makeDividerHandlers() {
  let tracking = false
  let left, right, parent
  let horiz
  let clickPos
  let leftPx, rightPx, totalPx
  return {
    'ev-pointerdown': e => {
      e.target.setPointerCapture(e.pointerId)
      tracking = true
      left = e.target.previousElementSibling
      right = e.target.nextElementSibling
      parent = e.target.parentElement
      horiz = (parent.style['flex-direction'] || 'row') == 'row'
      clickPos = horiz ? e.clientX : e.clientY
      const dim = horiz ? 'width' : 'height'
      totalPx = parent.getBoundingClientRect()[dim] - totalDividerSize(parent)[dim]
      leftPx = left.getBoundingClientRect()[dim]
      rightPx = right.getBoundingClientRect()[dim]
      e.preventDefault()
    },
    'ev-pointermove': e => {
      if (!tracking) return
      const delta = (horiz ? e.clientX : e.clientY) - clickPos
      setFlexBasis(left, delta, leftPx, totalPx)
      setFlexBasis(right, -delta, rightPx, totalPx)
      e.preventDefault()
    },
    'ev-pointerup': e => {
      tracking = false
      e.target.releasePointerCapture(e.pointerId)
      e.preventDefault()
    }
  }
}

function makeDivider() {
  return h('div.divider',
    Object.assign({
      style: {
        'flex-basis': '5px',
        'flex-grow': 0,
        'flex-shrink': 0,
        'user-select': 'none',
        'box-sizing': 'border-box',
        width: '100%',
        height: '100%'
      }}, makeDividerHandlers()
    )
  )
}

function makePane(flexBasis) {
  return h('div.pane', {
    style: {
      background: 'khaki',
      'flex-basis': flexBasis,
      'flex-grow': 1,
      'flex-shrink': 1,
      'box-sizing': 'border-box',
      'overflow': 'scroll',
      width: '100%',
      height: '100%'
    }
  })
}
