import { encrypt } from './encrypt';
import { createPopper } from '@popperjs/core';
import './tooltipBase.css';

// tipArea用来统一存放 tooltip
let tipArea = document.createElement('div');
tipArea.setAttribute('id', 'tipArea');
document.querySelector('body').appendChild(tipArea);

// 支持的方位设置
const placement = [
  'auto',
  'auto-start',
  'auto-end',
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'right',
  'right-start',
  'right-end',
  'left',
  'left-start',
  'left-end'
];

/**
 * v-tip 简介：
 * v-tip 指令是一个Vue框架的自定义指令，实现了用指令的方式为DOM元素添加一个tooltip。
 * 相比于更常见的组件形式的tooltip,v-tip指令使用更加便捷的同时，不会影响原本的DOM结构，更加轻巧。
 * v-tip 有两种模式可供开发者使用，分别是normal模式，update模式，两种模式使用方式的区别在于是否传入update修饰符。
 * normal模式仅有文本提示，类似于HTML元素的title属性。
 * update模式是 v-tip 做出创新的一个模式，用户未知更新时会有提示，用户已知更新后不再显示，支持记忆“用户已知更新”的状态。
 *
 * @example
 * <button v-tip="'我是提示框'"> </button>  默认在绑定DOM元素下方显示
 * @example
 * <button v-tip.sure="'我是提示框'"> </button> 有记忆存储功能 默认在绑定DOM元素下方显示,建议在常发生更新的元素上使用
 * @example
 * <button v-tip.left="'我是提示框'"></button>  传入修饰符，自定义提示框显示位置
 * 支持这些位置设置 | 'auto'| 'auto-start'| 'auto-end'| 'top'| 'top-start'| 'top-end'| 'bottom'| 'bottom-start'| 'bottom-end'| 'right'| 'right-start'| 'right-end'| 'left'| 'left-start'| 'left-end'
 * @example
 * <button v-tip.left.sure="'我是提示框'"></button>  左方显示, 更新模式
 * <button v-tip.sure.left="'我是提示框'"></button>  效果同上，修饰符顺序不影响功能
 */

/**
 * TipManager类
 * @class TipManager
 * @param {HTMLElement} el - tooltip实例的 reference DOM元素.
 * @param {Object} binding
 * @param {String} binding.value - 指令的绑定值，即提示文本
 * @param {Object} binding.modifiers - 一个包含修饰符的对象，用来确定tooltip提示模式，以及显示位置
 * @return {Object} instance - 返回一个 TipManager 的实例
 */
class TipManager {
  constructor(el, binding, vnode) {
    this.el = el;
    this.binding = binding;
    this.vnode = vnode;
    this.tipTextEncoded = encrypt(binding.value);
    this.isKnown =
      this.getTipMode() === 'sure'
        ? TipManager.tipStatusArr.includes(this.tipTextEncoded)
        : false;
    this.init();
  }
  init() {
    this.isElMouseover = false;
    this.isTooltipMouseover = false;
    // 初始化创建 tooltip DOM元素
    this.tooltip = document.createElement('div');

    let tipText = document.createElement('span');
    let arrow = document.createElement('div');

    tipText.innerHTML = this.binding.value;
    tipText.className = 'inner_text';
    this.tooltip.className += 'tooltip';
    arrow.className = 'arrow';

    this.tooltip.appendChild(tipText);
    tipArea.appendChild(this.tooltip);
    this.tooltip.appendChild(arrow);
    //tooltip 调整宽度
    if (byteLength(this.binding.value) <= 16) {
      this.tooltip.style.width = '100px';
    }
    // mode == sure, 当前模式为“确认模式”时
    if (this.getTipMode() === 'sure') {
      this.circle = document.createElement('div');
      let confirmBtn = document.createElement('button');
      this.circle.className = 'circle';
      confirmBtn.className = 'inner_button';
      confirmBtn.innerHTML = 'sure';
      this.el.appendChild(this.circle);
      this.tooltip.appendChild(confirmBtn);

      confirmBtn.addEventListener('click', event => {
        event.stopPropagation();
        // 绑定了相同提示信息的 tip 同时隐藏
        TipManager.instances.forEach(tipInstance => {
          if (tipInstance.tipTextEncoded === this.tipTextEncoded) {
            tipInstance.isKnown = true;
            tipInstance.tooltip.style.display = 'none';
            if (tipInstance.circle) tipInstance.circle.style.display = 'none';
          }
        });
        this.isKnown = true;
        this.tooltip.style.display = 'none';
        addconfirmedItem(this.tipTextEncoded);
        removeInvalidItem(TipManager.tipStatusArr, TipManager.activeTip);
      });

      if (!this.isKnown) {
        TipManager.tipCount++;
      }
    }

    this.popperInstance = createPopper(this.el, this.tooltip, {
      placement: this.getTipPlacement(),
      modifiers: [
        {
          name: 'arrow',
          options: {
            element: arrow
          }
        },
        {
          name: 'offset',
          options: {
            offset: [0, 8]
          }
        }
      ]
    });

    // 添加监听器事件
    this.addEventListeners();

    // 根据用户是否已知，决定显示或隐藏tooltip
    if (this.isKnown) {
      this.hide();
    } else {
      if (this.getTipMode() === 'sure' && TipManager.tipCount > 5) {
        this.circle.style.display = 'none';
      }
    }
    // 将 tooltip 当前经编码后的文本存入 activeTip 数组中
    TipManager.activeTip.push(this.tipTextEncoded);
  }
  // 获取tip当前模式
  getTipMode() {
    const keys = Object.keys(this.binding.modifiers);
    if (keys.length && keys.includes('sure')) {
      return 'sure'; // 确认模式
    }
    return 'normal'; // 普通提示模式
  }
  getTipPlacement() {
    const keys = Object.keys(this.binding.modifiers);
    if (keys.length) {
      const item = keys.find(key => {
        return placement.includes(key);
      });
      let tipPlacement = item ? item : 'bottom';
      return tipPlacement;
    }
    return 'bottom';
  }
  // 给 el 元素绑定事件,控制 tooltip 显示或隐藏
  addEventListeners() {
    const showEvents = ['mouseenter', 'focus'];
    const hideEvents = ['mouseleave', 'blur'];
    showEvents.forEach(event => {
      this.el.addEventListener(event, () => {
        this.vnode;
        this.isElMouseover = true;
        if (this.isElMouseover === true || this.isTooltipMouseover === true) {
          this.show();
        }
      });

      this.tooltip.addEventListener(event, () => {
        this.isTooltipMouseover = true;
        if (this.isElMouseover === true || this.isTooltipMouseover === true) {
          this.show();
        }
      });
    });
    hideEvents.forEach(event => {
      this.el.addEventListener(event, () => {
        this.isElMouseover = false;
        if (!this.isElMouseover && !this.isTooltipMouseover) {
          this.hide();
        }
      });
      this.tooltip.addEventListener(event, () => {
        this.isTooltipMouseover = false;
        if (!this.isElMouseover && !this.isTooltipMouseover) {
          this.hide();
        }
      });
    });
    this.tooltip.addEventListener('onclick', e => {
      var e = e || window.event;
      var t = e.target || e.srcElement;
      // 按下ESC，即回退页面
      if (e && e.keyCode == 27) {
        this.hide();
      }
    });
  }
  show() {
    // 用户未点击“确认”时，显示
    if (!this.isKnown) {
      this.tooltip.style.transitionDelay = '0.8s';
      this.tooltip.setAttribute('data-show', '');

      this.popperInstance.setOptions(options => ({
        ...options,
        modifiers: [
          ...options.modifiers,
          { name: 'eventListeners', enabled: true }
        ]
      }));

      // 在显示 Popper 后，需要通知 Popper 更新位置，否则将会出错
      this.popperInstance.update();
    }
  }
  hide() {
    this.tooltip.style.transitionDelay = '0.3s';
    this.tooltip.removeAttribute('data-show');

    if (this.getTipMode() === 'sure' && this.isKnown) {
      this.circle.style.display = 'none';
    }

    this.popperInstance.setOptions(options => ({
      ...options,
      modifiers: [
        ...options.modifiers,
        { name: 'eventListeners', enabled: false }
      ]
    }));
  }
  destroy() {
    this.popperInstance.destroy();
  }
}
TipManager.instances = [];
TipManager.tipStatusArr = getTipStatusArr();
TipManager.activeTip = [];
TipManager.tipCount = 0;

function getTipStatusArr() {
  return JSON.parse(localStorage.getItem('tipStatusArr'))
    ? JSON.parse(localStorage.getItem('tipStatusArr'))
    : [];
}

// 将用户已“确认”的提示存入记忆数组
function addconfirmedItem(tipTextEncoded) {
  TipManager.tipStatusArr.push(tipTextEncoded);
  localStorage.setItem('tipStatusArr', JSON.stringify(TipManager.tipStatusArr));
}

// 清理掉“过期”的tooltip提示文本
function removeInvalidItem(tipStatusArr, activeTip) {
  for (var i = 0; i < tipStatusArr.length; i++) {
    if (!activeTip.includes(tipStatusArr[i])) {
      tipStatusArr.splice(i, 1);
      i--; // 如果不减，将漏掉一个元素
    }
  }
  localStorage.removeItem('tipStatusArr');
  localStorage.setItem('tipStatusArr', JSON.stringify(tipStatusArr));
}

// 计算字符串的字节数
function byteLength(string) {
  var b = 0;
  length = string.length;
  if (length) {
    for (var i = 0; i < length; i++) {
      if (string.charCodeAt(i) > 255) {
        b += 2;
      } else {
        b++;
      }
    }
    return b;
  } else {
    return 0;
  }
}

let options = {
  bind(el, binding, vnode) {
    TipManager.instances.push(new TipManager(el, binding, vnode));
  },
  unbind(el, binding) {
    TipManager.tipCount--;
    TipManager.instances.forEach(item => {
      if (item.binding === binding) {
        item.popperInstance.destroy();
      }
    });
  }
};

export default options;
