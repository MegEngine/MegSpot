import console from 'console'
import store from '../store'
import { Message } from 'element-ui'

const isDrawn = process.platform === 'darwin'

export const ATTRS_KEYS = [
  {
    name: 'ctrlKey',
    key: 'Control',
    label: isDrawn ? 'Control' : 'Ctrl'
  },
  {
    name: 'metaKey',
    key: 'Meta',
    label: isDrawn ? '⌘ Command' : '⊞ Win'
  },
  {
    name: 'altKey',
    key: isDrawn ? 'Option' : 'Alt',
    label: isDrawn ? '⌥ Option' : 'Alt'
  }
]

export const ATTRS_KEYS_VALUE = ['Control', 'Meta', 'Option', 'Alt']

export const SPECIAL_KEYS = [
  ...ATTRS_KEYS,
  { name: 'Shift', key: 'Shift', label: 'Shift' },
  { name: 'Enter', key: 'Enter', label: 'Enter' },
  {
    name: 'Space',
    key: ' ',
    label: 'Space'
  },
  {
    name: 'Escape',
    key: 'Escape',
    label: 'Esc'
  },
  {
    name: 'ArrowLeft',
    key: 'ArrowLeft',
    label: '←'
  },
  {
    name: 'ArrowUp',
    key: 'ArrowUp',
    label: '↑' // ⇧
  },
  {
    name: 'ArrowRight',
    key: 'ArrowRight',
    label: '→'
  },
  {
    name: 'ArrowDown',
    key: 'ArrowDown',
    label: '↓'
  }
]

export const PRESET_KEYS = [...SPECIAL_KEYS]

export const PRESET_KEYS_MAP = new Map(PRESET_KEYS.map((item) => [item.key, item]))

const ctrlOrCommand = isDrawn ? 'Meta' : 'Control'

export const DEFAULT_HOTKEYS = [
  {
    index: 1,
    name: 'gotoCompare',
    desc: 'jump to compare',
    keysArr: [[ctrlOrCommand, 'Enter']]
  },
  {
    index: 2,
    name: 'emptyAll',
    desc: 'empty all selected files',
    keysArr: [[ctrlOrCommand, 'Delete']]
  },
  {
    index: 3,
    name: 'back',
    desc: 'back to file select',
    keysArr: [['Escape']]
  },
  {
    index: 4,
    name: 'gallery',
    desc: 'show/hide select file gallery',
    keysArr: [[ctrlOrCommand, 'f']]
  },
  {
    index: 5,
    name: 'previousGroup',
    desc: 'change to previous group',
    keysArr: [[ctrlOrCommand, 'ArrowLeft']]
  },
  {
    index: 6,
    name: 'nextGroup',
    desc: 'change to next group',
    keysArr: [[ctrlOrCommand, 'ArrowRight']]
  },
  // 前一帧 (暂停时可用)
  {
    index: 7,
    name: 'previousFrame',
    desc: 'Compare video frame by frame (play forward ←)',
    keysArr: [[ctrlOrCommand, 'b']]
  },
  // 后一帧 (暂停时可用)
  {
    index: 8,
    name: 'nextFrame',
    desc: 'Compare video frame by frame (play backwards →)',
    keysArr: [[ctrlOrCommand, 'n']]
  },
  {
    index: 9,
    name: 'togglePlay',
    desc: 'paly/pause video',
    keysArr: [[' ']]
  },
  {
    index: 10,
    name: 'top',
    desc: 'compare to top',
    keysArr: [['w'], ['ArrowUp']]
  },
  {
    index: 11,
    name: 'left',
    desc: 'compare to left',
    keysArr: [['a'], ['ArrowLeft']]
  },
  {
    index: 12,
    name: 'bottom',
    desc: 'compare to bottom',
    keysArr: [['s'], ['ArrowDown']]
  },
  {
    index: 13,
    name: 'right',
    desc: 'compare to right',
    keysArr: [['d'], ['ArrowRight']]
  },
  {
    index: 14,
    name: 'pickColor',
    desc: 'pick color in image',
    keysArr: [[ctrlOrCommand, 'p']]
  }
]

export function getArrStr(arr) {
  return JSON.parse(JSON.stringify(arr)).sort().toString()
}

export function getPressedKeysStr(event) {
  const attrsKeys = ATTRS_KEYS.map((item) => item.name)
  const attrsKeyIndex = attrsKeys.findIndex((key) => event[key])
  const pressedKeys = [event.key]
  if (attrsKeyIndex > -1) {
    pressedKeys.push(ATTRS_KEYS.find((keyConf) => keyConf.name === attrsKeys[attrsKeyIndex]).key)
  }
  return pressedKeys.sort().toString()
}

export function ensureHotkeysMapExists() {
  store.dispatch('preferenceStore/ensureHotkeysMap') // 确保keysMap存在
}

export function handleEvent(event, callbackFnMap) {
  ensureHotkeysMapExists()
  const hotkeysMap = store.state.preferenceStore.hotkeysMap
  const pressedKeysStr = getPressedKeysStr(event)
  const hotkeyName = hotkeysMap.get(pressedKeysStr)
  const hotkeyEvent = callbackFnMap.get(hotkeyName)
  if (hotkeyName && hotkeyEvent) {
    hotkeyEvent()
  }
}
