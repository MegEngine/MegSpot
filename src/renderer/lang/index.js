import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN' // element-ui lang
import elementJaLocale from 'element-ui/lib/locale/lang/ja' // element-ui lang
import enLocale from './en'
import zhLocale from './zh'
import jaLocale from './ja'

Vue.use(VueI18n)

const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale
  },
  zh: {
    ...zhLocale,
    ...elementZhLocale
  },
  ja: {
    ...jaLocale,
    ...elementJaLocale
  }
}

const i18n = new VueI18n({
  messages
})

export function i18nRender(key) {
  return i18n.t(key)
}

export default i18n
