var picture = /** @class */ (function() {
  var radius = 240

  var imgWidth = 120
  var imgHeight = 170

  var obox = document.getElementById('drag-container')
  var ospin = document.getElementById('spin-container')
  var ele = document.querySelectorAll(
    '#spin-container img, #spin-container video'
  )
  // var aA = ospin.getElementsByTagName('a')

  var aEle = [...ele]
  ospin.style.width = imgWidth + 'px'
  ospin.style.height = imgHeight + 'px'

  function SpinEle(selector) {
    setTimeout(() => {
      this.init()
      this.initListener() //初始化监听器
    }, 100)

    /* 初始化参数 */
    Object.assign(this, {
      selector: selector,
      container: document.querySelector(selector),
      radius: 240,
      imgWidth: 120,
      imgHeight: 170
    })
  }
  SpinEle.prototype = {
    init: function(delayTime) {
      let { radius } = this
      for (var i = 0; i < aEle.length; i++) {
        aEle[i].style.transform = `rotateY(${(i * 360) /
          aEle.length}deg) translateZ(${radius}px)`
        aEle[i].style.transition = `transform 1s`
        aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + 's'
      }
    },
    initListener: function() {
      let { container } = this
      let currentX = 0,
        currentY = 0,
        lastX = 0,
        lastY = 0,
        lastDx = 0,
        lastDy = 0,
        sensitivity = 0.1,
        isMouseDown = false,
        frame = 60,
        interval = 1000 / frame

      function applyTransform() {
        if (lastY >= 110) lastY = 110
        if (lastY <= 0) lastY = 0
        if (lastX >= 360 || lastX <= -360) lastX %= 360
        obox.style.transform = `rotateX(${-lastY}deg) rotateY(${lastX}deg)`
      }

      /*添加拖拽事件*/
      let mouseMove = throttle(function(event) {
        if (isMouseDown) {
          let { clientX, clientY } = event
          lastDx = sensitivity * (clientX - currentX)
          lastDy = sensitivity * (clientY - currentY)
          ;(lastX += lastDx), (lastY += lastDy)
          currentX = clientX
          currentY = clientY
          applyTransform()
        }
      }, interval)

      let mouseUp = function(event) {
        container.removeEventListener('mousemove', mouseMove)
        // container.removeEventListener('mouseup', mouseUp)
        let { clientX, clientY } = event
        isMouseDown = false

        /* 修复timer 没被清除，当连续触发两次该事件时, 上一个timer没有被即使清除就设置了新的timer， 造成内存泄漏 */
        clearInterval(obox.timer)
        obox.timer = setInterval(function() {
          lastX += lastDx
          lastY += lastDy
          lastDx *= 0.95
          lastDy *= 0.95
          applyTransform()
          if (Math.abs(lastDx) < 0.05 && Math.abs(lastDy) < 0.05) {
            clearInterval(obox.timer)
          }
        }, interval)
      }

      container.addEventListener('mouseup', mouseUp)
      container.addEventListener('mouseleave', mouseUp)
      container.addEventListener('mousedown', function(event) {
        // 清除动画
        clearInterval(obox.timer)

        // 获取位置
        let { clientX, clientY } = event
        ;(currentX = clientX), (currentY = clientY)

        // 设置mouseDown为true
        isMouseDown = true

        // 阻止默认的拖拽事件
        event.preventDefault()
        container.addEventListener('mousemove', mouseMove)
      })
    }
  }

  function throttle(func, delay) {
    let running = false
    return function() {
      if (!running) {
        running = true
        let args = Array.from(arguments)
        func(...args)
        setTimeout(() => {
          running = false
        }, delay)
      }
    }
  }
  return SpinEle
})()

new picture('#target')
