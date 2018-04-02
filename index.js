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

function makeDivider() {

  function makeDividerHandlers() {
    let tracking = false
    let prev, next, parent
    let origin
    let currentPercentage, currentPx
    let horiz
    return {
      'ev-pointerdown': e => {
        e.target.setPointerCapture(e.pointerId)
        tracking = true
        prev = e.target.previousElementSibling
        next = e.target.nextElementSibling
        parent = e.target.parentElement
        horiz = (parent.style['flex-direction'] || 'row') == 'row'
        origin = horiz ? e.clientX : e.clientY
        currentPercentage = parseFloat(prev.style['flex-basis'])
        currentPx = prev.getBoundingClientRect()[ horiz ? 'width' : 'height']
        e.preventDefault()
      },
      'ev-pointermove': e => {
        if (!tracking) return
        const delta = (horiz ? e.clientX : e.clientY) - origin
        const newPrecentage = currentPercentage / currentPx * (currentPx + delta)
        prev.style['flex-basis'] = `${newPrecentage}%`
        next.style['flex-basis'] = `${100 - newPrecentage}%`
        e.preventDefault()
      },
      'ev-pointerup': e => {
        tracking = false
        e.target.releasePointerCapture(e.pointerId)
        e.preventDefault()
      }
    }
  }

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
