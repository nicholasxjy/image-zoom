## image-zoom

a medium like image zoom plugin

## Features

- Small

- No other deps

## Installation

```bash
$ npm install --save nico-zoom
```

## Getting started

```html
  <script src="./dist/NZoom.min.js"></script>
  <script>
    window.onload = function() {
      var container = document.querySelector('.content')
      new NZoom(container, {
          gutter: 30,
          scrollOffset: 10,
          overlayBg: '#ffffff',
          scaleFactor: 1,
          beforeZoomIn: () => {},
          afterZoomIn: () => {},
          beforeZoomOut: () => {},
          afterZoomOut: () => {}
      })
    }
  </script>
```

```javascript
import NZoom from 'nico-zoom'

new NZoom(document.querySelector('.content'), {
  gutter: 30,
  scrollOffset: 10,
  overlayBg: '#ffffff',
  scaleFactor: 1,
  beforeZoomIn: () => {},
  afterZoomIn: () => {},
  beforeZoomOut: () => {},
  afterZoomOut: () => {}
})
```
