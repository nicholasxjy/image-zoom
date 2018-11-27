function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".image-zoom {\n  overflow: visible !important;\n}\n.image-zoom-container {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.image-zoom-content {\n  position: relative;\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n  -webkit-transition: -webkit-transform 300ms cubic-bezier(0.2, 0, 0.2, 1);\n  transition: -webkit-transform 300ms cubic-bezier(0.2, 0, 0.2, 1);\n  transition: transform 300ms cubic-bezier(0.2, 0, 0.2, 1);\n  transition: transform 300ms cubic-bezier(0.2, 0, 0.2, 1), -webkit-transform 300ms cubic-bezier(0.2, 0, 0.2, 1);\n  will-change: transform;\n}\n.image-zoom-target {\n  cursor: pointer;\n  cursor: -webkit-zoom-in;\n  cursor: zoom-in;\n}\n\n.image-zoom-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  width: 100%;\n  height: 100%;\n  z-index: -1;\n  cursor: pointer;\n  cursor: -webkit-zoom-out;\n  cursor: zoom-out;\n  opacity: 0;\n  visibility: hidden;\n  -webkit-transition: opacity 0.3s linear, visibility 0s linear;\n  transition: opacity 0.3s linear, visibility 0s linear;\n  will-change: opacity;\n}\n.image-zoom--open .image-zoom-overlay {\n  visibility: visible;\n  opacity: 1;\n  z-index: 9999;\n  cursor: pointer;\n  cursor: -webkit-zoom-out;\n  cursor: zoom-out;\n}\n\n.image-zoom--open .image-zoom-container.open .image-zoom-content {\n  z-index: 10000;\n  cursor: pointer;\n  cursor: -webkit-zoom-out;\n  cursor: zoom-out;\n}\n\n.image-zoom--open .image-zoom-container.open .image-zoom-target {\n  cursor: pointer;\n  cursor: -webkit-zoom-out;\n  cursor: zoom-out;\n}\n";
styleInject(css);

var defaultOptions = {
  items: '',
  gutter: 20,
  scrollOffset: 10,
  overlayBg: '#ffffff',
  scaleFactor: 1,
  beforeZoomIn: function beforeZoomIn() {},
  afterZoomIn: function afterZoomIn() {},
  beforeZoomOut: function beforeZoomOut() {},
  afterZoomOut: function afterZoomOut() {}
};

function isMobile() {
  var ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/gi.test(ua);
}

function getScrollTop() {
  return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
}

function getScale(_ref) {
  var width = _ref.width,
      height = _ref.height,
      gutter = _ref.gutter;
  var scaleX = window.innerWidth / (width + gutter * 2);
  var scaleY = window.innerHeight / (height + gutter * 2);
  return Math.min(scaleX, scaleY);
}

function calScale(_ref2) {
  var w = _ref2.w,
      h = _ref2.h,
      nw = _ref2.nw,
      nh = _ref2.nh,
      gutter = _ref2.gutter;
  var scale = getScale({
    width: nw,
    height: nh,
    gutter: gutter
  });
  var ratio = nw > nh ? nw / w : nh / h;
  return scale > 1 ? ratio : ratio * scale;
}

function createPortal(tag, classname) {
  var portal = document.createElement(tag);

  if (classname) {
    portal.classList.add(classname);
  }

  return portal;
}

function wrapTargetContainer(item) {
  var parent = item.parentNode;
  item.classList.add('image-zoom-target');
  var container = createPortal('div', 'image-zoom-container');
  var content = createPortal('div', 'image-zoom-content');
  container.appendChild(content);
  content.appendChild(item);
  parent.appendChild(container);
}

var ImageZoom =
/*#__PURE__*/
function () {
  function ImageZoom(container, options) {
    this.setOptions(options);
    this.container = container;
    this.isAnimating = false;
    this._handleClick = this._handleClick.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this._bindEvents = this._bindEvents.bind(this);
    this._unbindEvents = this._unbindEvents.bind(this);
    this._destroyZoomer = this._destroyZoomer.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this._createZoomOverlay();

    this._init();
  }

  var _proto = ImageZoom.prototype;

  _proto.setOptions = function setOptions(options) {
    this.options = Object.assign({}, defaultOptions, options);
  };

  _proto.refreshElements = function refreshElements() {
    this.elements = this.container.querySelectorAll(this.options.items);

    this._createContainerOfElements();
  };

  _proto._init = function _init() {
    if (!this.options.items) {
      throw new Error('no items set!');
    }

    this.elements = this.container.querySelectorAll(this.options.items);

    this._createContainerOfElements();

    this._bindClickDelegateToContainer();
  };

  _proto._createZoomOverlay = function _createZoomOverlay() {
    var overlayBg = this.options.overlayBg;
    this._overlay = createPortal('div', 'image-zoom-overlay');
    this._overlay.style.backgroundColor = overlayBg;
    document.body.appendChild(this._overlay);
  };

  _proto._createContainerOfElements = function _createContainerOfElements() {
    this.elements.forEach(function (item) {
      wrapTargetContainer(item);
    });
  };

  _proto.onTouchStart = function onTouchStart(e) {
    this.yTouchPosition = e.touches[0].clientY;
  };

  _proto.onTouchMove = function onTouchMove(e) {
    var scrollOffset = this.options.scrollOffset;

    if (this.yTouchPosition) {
      var touchChange = Math.abs(e.touches[0].clientY - this.yTouchPosition);

      if (!this.isAnimating) {
        this.zoomOut();
      }
    }
  };

  _proto.onTouchEnd = function onTouchEnd() {
    this.yTouchPosition = null;
  };

  _proto._bindTouchEvents = function _bindTouchEvents() {
    window.addEventListener('ontouchstart', this.onTouchStart, false);
    window.addEventListener('ontouchmove', this.onTouchMove, false);
    window.addEventListener('ontouchend', this.onTouchEnd, false);
    window.addEventListener('ontouchcancel', this.onTouchEnd, false);
  };

  _proto._unbindTouchEvents = function _unbindTouchEvents() {
    window.removeEventListener('ontouchstart', this.onTouchStart, false);
    window.removeEventListener('ontouchmove', this.onTouchMove, false);
    window.removeEventListener('ontouchend', this.onTouchEnd, false);
    window.removeEventListener('ontouchcancel', this.onTouchEnd, false);
  };

  _proto.zoomIn = function zoomIn() {
    var beforeZoomIn = this.options.beforeZoomIn;
    beforeZoomIn();
    this._scrollTop = getScrollTop();
    document.body.classList.add('image-zoom--open');

    this._bindEvents();

    if (isMobile()) {
      this._bindTouchEvents();
    }

    this._animateTarget();
  };

  _proto._animateTarget = function _animateTarget() {
    var _this = this;

    this.isAnimating = true;
    var _this$options = this.options,
        afterZoomIn = _this$options.afterZoomIn,
        gutter = _this$options.gutter;
    this._zoomtarget = this._target.parentNode;
    this._container = this._target.parentNode.parentNode;

    this._container.classList.add('open');

    var rect = this._zoomtarget.getBoundingClientRect();

    var top = rect.top,
        left = rect.left,
        width = rect.width,
        height = rect.height;
    var _this$_target = this._target,
        naturalWidth = _this$_target.naturalWidth,
        naturalHeight = _this$_target.naturalHeight;
    var viewportCenterX = window.innerWidth / 2;
    var viewportCenterY = window.innerHeight / 2;
    var targetCenterX = left + width / 2;
    var targetCenterY = top + height / 2;
    var scale = calScale({
      w: width,
      h: height,
      nw: naturalWidth,
      nh: naturalHeight,
      gutter: gutter
    });
    var translateX = (viewportCenterX - targetCenterX) / scale;
    var translateY = (viewportCenterY - targetCenterY) / scale;
    this._zoomtarget.style.width = width + "px";
    this._zoomtarget.style.height = height + "px";
    this._zoomtarget.style.transform = "scale(" + scale + ") translate3d(" + translateX + "px, " + translateY + "px, 0)";
    this._zoomtarget.style.webkitTransform = "scale(" + scale + ") translate3d(" + translateX + "px, " + translateY + "px, 0)";
    this._zoomtarget.style.MozTransform = "scale(" + scale + ") translate3d(" + translateX + "px, " + translateY + "px, 0)";
    this._zoomtarget.style.msTransform = "scale(" + scale + ") translate3d(" + translateX + "px, " + translateY + "px, 0)";
    this._zoomtarget.style.OTransform = "scale(" + scale + ") translate3d(" + translateX + "px, " + translateY + "px, 0)";
    setTimeout(function () {
      _this.isAnimating = false;
    }, 300); // excute hook

    afterZoomIn();
  };

  _proto.zoomOut = function zoomOut() {
    var _this2 = this;

    var _this$options2 = this.options,
        beforeZoomOut = _this$options2.beforeZoomOut,
        afterZoomOut = _this$options2.afterZoomOut;
    beforeZoomOut();

    this._container.classList.remove('open');

    document.body.classList.remove('image-zoom--open');
    this._zoomtarget.style.transform = 'none';

    if (isMobile()) {
      this._unbindTouchEvents();
    }

    setTimeout(function () {
      _this2.isAnimating = false;

      _this2._destroyZoomer();
    }, 300);
    afterZoomOut();
  };

  _proto._bindEvents = function _bindEvents() {
    this._overlay.addEventListener('click', this.zoomOut, false);

    window.addEventListener('scroll', this.onScroll, false);
    window.addEventListener('resize', this.onResize, false);
  };

  _proto._unbindEvents = function _unbindEvents() {
    this._overlay.removeEventListener('click', this.zoomOut, false);

    window.removeEventListener('scroll', this.onScroll, false);
    window.removeEventListener('resize', this.onResize, false);
  };

  _proto._destroyZoomer = function _destroyZoomer() {
    this._unbindEvents();

    this._target = null;
    this._zoomtarget = null;
    this._container = null;
  };

  _proto.destroy = function destroy() {
    document.body.classList.remove('image-zoom--open');
    document.body.removeChild(this._overlay);
  };

  _proto.onResize = function onResize() {
    if (!this.isAnimating) {
      this.zoomOut();
    }
  };

  _proto.onScroll = function onScroll() {
    var scrollOffset = this.options.scrollOffset;
    var st = getScrollTop();

    if (Math.abs(this._scrollTop - st) > scrollOffset) {
      if (!this.isAnimating) {
        this.zoomOut();
      }
    }
  };

  _proto._bindClickDelegateToContainer = function _bindClickDelegateToContainer() {
    this.container.addEventListener('click', this._handleClick, false);
  };

  _proto._handleClick = function _handleClick(e) {
    var target = e.target;
    var body = document.body;

    if (target.tagName === 'IMG') {
      this._target = target;

      if (body.classList.contains('image-zoom--open')) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    }
  };

  return ImageZoom;
}();

export default ImageZoom;
