import './zoom.css'

const defaultOptions = {
  items: '',
  gutter: 20,
  scrollOffset: 10,
  overlayBg: '#ffffff',
  scaleFactor: 1,
  beforeZoomIn: () => {},
  afterZoomIn: () => {},
  beforeZoomOut: () => {},
  afterZoomOut: () => {}
}

function isMobile() {
  const ua = navigator.userAgent
  return /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/gi.test(ua)
}

function getScrollTop() {
  return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop)
}

function getScale({ width, height, gutter }) {
  const scaleX = window.innerWidth / (width + gutter * 2)
  const scaleY = window.innerHeight / (height + gutter * 2)
  return Math.min(scaleX, scaleY)
}

function calScale({ w, h, nw, nh, gutter }) {
  const scale = getScale({ width: nw, height: nh, gutter })
  const ratio = nw > nh ? nw / w : nh / h

  return scale > 1 ? ratio : ratio * scale
}

function createPortal(tag, classname) {
  const portal = document.createElement(tag)
  if (classname) {
    portal.classList.add(classname)
  }
  return portal
}

function wrapTargetContainer(item) {
  const parent = item.parentNode
  item.classList.add('image-zoom-target')
  const container = createPortal('div', 'image-zoom-container')
  const content = createPortal('div', 'image-zoom-content')
  container.appendChild(content)
  content.appendChild(item)
  parent.appendChild(container)
}

class ImageZoom {
  constructor(container, options) {
    this.setOptions(options)
    this.container = container
    this.isAnimating = false
    this._handleClick = this._handleClick.bind(this)
    this.zoomIn = this.zoomIn.bind(this)
    this.zoomOut = this.zoomOut.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.onResize = this.onResize.bind(this)
    this._bindEvents = this._bindEvents.bind(this)
    this._unbindEvents = this._unbindEvents.bind(this)
    this._destroyZoomer = this._destroyZoomer.bind(this)

    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)

    this._createZoomOverlay()
    this._init()
  }
  setOptions(options) {
    this.options = Object.assign({}, defaultOptions, options)
  }
  refreshElements() {
    this.elements = this.container.querySelectorAll(this.options.items)
    this._createContainerOfElements()
  }
  _init() {
    if (!this.options.items) {
      throw new Error('no items set!')
    }
    this.elements = this.container.querySelectorAll(this.options.items)
    this._createContainerOfElements()
    this._bindClickDelegateToContainer()
  }
  _createZoomOverlay() {
    const { overlayBg } = this.options
    this._overlay = createPortal('div', 'image-zoom-overlay')
    this._overlay.style.backgroundColor = overlayBg
    document.body.appendChild(this._overlay)
  }
  _createContainerOfElements() {
    this.elements.forEach(item => {
      wrapTargetContainer(item)
    })
  }
  onTouchStart(e) {
    this.yTouchPosition = e.touches[0].clientY
  }
  onTouchMove(e) {
    const { scrollOffset } = this.options
    if (this.yTouchPosition) {
      const touchChange = Math.abs(e.touches[0].clientY - this.yTouchPosition)
      if (!this.isAnimating) {
        this.zoomOut()
      }
    }
  }
  onTouchEnd() {
    this.yTouchPosition = null
  }
  _bindTouchEvents() {
    window.addEventListener('ontouchstart', this.onTouchStart, false)
    window.addEventListener('ontouchmove', this.onTouchMove, false)
    window.addEventListener('ontouchend', this.onTouchEnd, false)
    window.addEventListener('ontouchcancel', this.onTouchEnd, false)
  }
  _unbindTouchEvents() {
    window.removeEventListener('ontouchstart', this.onTouchStart, false)
    window.removeEventListener('ontouchmove', this.onTouchMove, false)
    window.removeEventListener('ontouchend', this.onTouchEnd, false)
    window.removeEventListener('ontouchcancel', this.onTouchEnd, false)
  }
  zoomIn() {
    const { beforeZoomIn } = this.options
    beforeZoomIn()
    this._scrollTop = getScrollTop()
    document.body.classList.add('image-zoom--open')
    this._bindEvents()
    if (isMobile()) {
      this._bindTouchEvents()
    }
    this._animateTarget()
  }
  _animateTarget() {
    this.isAnimating = true
    const { afterZoomIn, gutter } = this.options
    this._zoomtarget = this._target.parentNode
    this._container = this._target.parentNode.parentNode
    this._container.classList.add('open')
    const rect = this._zoomtarget.getBoundingClientRect()
    const { top, left, width, height } = rect
    const { naturalWidth, naturalHeight } = this._target
    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2
    const targetCenterX = left + width / 2
    const targetCenterY = top + height / 2

    const scale = calScale({
      w: width,
      h: height,
      nw: naturalWidth,
      nh: naturalHeight,
      gutter
    })

    const translateX = (viewportCenterX - targetCenterX) / scale
    const translateY = (viewportCenterY - targetCenterY) / scale

    this._zoomtarget.style.width = `${width}px`
    this._zoomtarget.style.height = `${height}px`
    this._zoomtarget.style.transform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`
    this._zoomtarget.style.webkitTransform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`
    this._zoomtarget.style.MozTransform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`
    this._zoomtarget.style.msTransform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`
    this._zoomtarget.style.OTransform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`
    setTimeout(() => {
      this.isAnimating = false
    }, 300)
    // excute hook
    afterZoomIn()
  }
  zoomOut() {
    const { beforeZoomOut, afterZoomOut } = this.options
    beforeZoomOut()
    this._container.classList.remove('open')
    document.body.classList.remove('image-zoom--open')
    this._zoomtarget.style.transform = 'none'
    if (isMobile()) {
      this._unbindTouchEvents()
    }
    setTimeout(() => {
      this.isAnimating = false
      this._destroyZoomer()
    }, 300)
    afterZoomOut()
  }
  _bindEvents() {
    this._overlay.addEventListener('click', this.zoomOut, false)
    window.addEventListener('scroll', this.onScroll, false)
    window.addEventListener('resize', this.onResize, false)
  }
  _unbindEvents() {
    this._overlay.removeEventListener('click', this.zoomOut, false)
    window.removeEventListener('scroll', this.onScroll, false)
    window.removeEventListener('resize', this.onResize, false)
  }
  _destroyZoomer() {
    this._unbindEvents()
    this._target = null
    this._zoomtarget = null
    this._container = null
  }
  destroy() {
    document.body.classList.remove('image-zoom--open')
    document.body.removeChild(this._overlay)
  }
  onResize() {
    if (!this.isAnimating) {
      this.zoomOut()
    }
  }
  onScroll() {
    const { scrollOffset } = this.options
    const st = getScrollTop()
    if (Math.abs(this._scrollTop - st) > scrollOffset) {
      if (!this.isAnimating) {
        this.zoomOut()
      }
    }
  }
  _bindClickDelegateToContainer() {
    this.container.addEventListener('click', this._handleClick, false)
  }
  _handleClick(e) {
    const target = e.target
    const body = document.body
    if (target.tagName === 'IMG') {
      this._target = target
      if (body.classList.contains('image-zoom--open')) {
        this.zoomOut()
      } else {
        this.zoomIn()
      }
    }
  }
}

export default ImageZoom
