import { initializeApp } from 'firebase/app'

import { getAnalytics, logEvent } from 'firebase/analytics'
import { getFirestore, collection, addDoc } from 'firebase/firestore/lite'

import { getPerformance } from '@/tools/performance'
import store from '../store'

export let app, analytics, db

export const initAnalyze = () => {
  const firebaseConfig = {
    apiKey: '$API_KEY',
    authDomain: 'megspot-0.firebaseapp.com',
    projectId: 'megspot-0',
    storageBucket: 'megspot-0.appspot.com',
    messagingSenderId: '1054782978677',
    appId: '1:1054782978677:web:8bf5029ec4f668f49e163c',
    measurementId: 'G-4VR70XBWVE'
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig)

  analytics = getAnalytics(app)
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app)
}

export const addRecord = async (tableName, data = {}) => {
  if (!db) {
    console.log('db is null', app, db)
    return
  }
  try {
    if (!data?.performance) {
      data.performance = getPerformance()
    }
    addDoc(collection(db, tableName), data)
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}

export const trackEvent = (event, data = {}) => {
  if (!data?.performance) {
    data.performance = getPerformance()
  }
  data['megspot_uuid'] = getUuid()
  analytics && logEvent(analytics, event, data)
  addRecord('logs', data)
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  )
}

function getUuid() {
  let uuid = store.state.preferenceStore.uuid
  if (!uuid) {
    store.dispatch('preferenceStore/setUuid', uuidv4())
    uuid = store.state.preferenceStore.uuid
  }
  return uuid
}
