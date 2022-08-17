/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Set environment for development
process.env.NODE_ENV = 'development'

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })
require('@electron/remote/main').initialize()
// Install `vue-devtools`
require('electron').app.on('ready', () => {
  // let installExtension = require('electron-devtools-installer')
  // installExtension.default(installExtension.VUEJS_DEVTOOLS)
  //   .then(() => {})
  //   .catch(err => {
  //     console.log('Unable to install `vue-devtools`: \n', err)
  //   })
  // const { VUEJS_DEVTOOLS } = require("electron-devtools-vendor"); // Vue2 Extension
  // session.defaultSession.loadExtension(VUEJS_DEVTOOLS, {
  //   allowFileAccess: true
  // });
  // console.log('已安装: vue-devtools1')
})

// Require `main` process to boot app
require('./index')
