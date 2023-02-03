import { initializeApp } from 'firebase/app'

import { getAnalytics, logEvent } from 'firebase/analytics'
import { getFirestore, collection, addDoc } from 'firebase/firestore/lite'

import { getPerformance } from '@/tools/performance'

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
  analytics && logEvent(analytics, event, data)
  addRecord('logs', data)
}
