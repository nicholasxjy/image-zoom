# image-zoom

### a medium like image zoom plugin

### how to use it

```html

  <script src="./dist/zoom.min.js"></script>
  <script>
    window.onload = function() {
      var container = document.querySelector('.content')
      new ImageZoom(container, {
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


### you can open index.html to see the demo effect
