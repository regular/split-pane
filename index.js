const h = require('mutant/html-element')
const setStyles = require('module-styles')('spit-pane')

setStyles(`
  .horizontal-split-pane > .divider {
    cursor: col-resize
  }
  .vertical-split-pane > .divider {
    cursor: row-resize
  }
  .pane {
    overflow: auto;
  }
`)

module.exports = {
  makeSplitPane,
  makeDivider,
  makePane
}

function makeSplitPane(opts, children) {
  const horiz = opts.horiz
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

function snap(leftPx, rightPx, totalPx, delta, snapRadius, snaps) {
  snaps = snaps.map( x => x > 1 ? x : x * totalPx)
  let ret = delta

  snaps.forEach( s => {
    if (Math.abs(leftPx + delta - s) <= snapRadius) {
      ret = s - leftPx
    }
    if (Math.abs(rightPx - delta - s) <= snapRadius) {
      ret = rightPx - s
    }
  })  
  return ret
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
      let delta = (horiz ? e.clientX : e.clientY) - clickPos

      delta = snap(leftPx, rightPx, totalPx, delta, 10, [30, 60, 0.25, 0.5, 0.75])

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
        'width': 'auto',
        'height': 'auto'
      }}, makeDividerHandlers()
    )
  )
}

function makePane(flexBasis, children) {
  return h('div.pane', {
    style: {
      'flex-basis': flexBasis,
      'flex-grow': 1,
      'flex-shrink': 1,
      'box-sizing': 'border-box',
      width: '100%',
      height: '100%'
    }
  }, children)
}
