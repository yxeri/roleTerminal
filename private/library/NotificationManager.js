/*
 Copyright 2019 Carmilla Mina Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const storageManager = require('./StorageManager');
const userComposer = require('./data/composers/UserComposer');

class NotificationManager {
  constructor() {
    this.token = null;
    this.inForeground = true;
  }

  start() {
    if (window.cordova) {
      document.addEventListener('deviceready', () => {
        this.sendPushToken();

        window.FirebasePlugin.grantPermission();

        window.FirebasePlugin.onTokenRefresh(() => {
          this.sendPushToken();
        }, (error) => {
          alert(error);
        });

        window.FirebasePlugin.onNotificationOpen((notification) => {
          document.getElementById('main').appendChild(document.createTextNode(JSON.parse(notification)));
        }, (error) => {
          alert(error);
        });
      });

      document.addEventListener('pause', () => {
        this.inForeground = false;
      });

      document.addEventListener('resume', () => {
        this.inForeground = true;
      });
    } else if (window.chrome) {
      firebase.initializeApp({ // eslint-disable-line
        apiKey: 'AIzaSyDxea8pkc5i5uf2ZDquyPprelzF0Zo2Ahw',
        authDomain: 'roleterminal-45929.firebaseapp.com',
        databaseURL: 'https://roleterminal-45929.firebaseio.com',
        projectId: 'roleterminal-45929',
        storageBucket: 'roleterminal-45929.appspot.com',
        messagingSenderId: '577846870008',
        appId: '1:577846870008:web:031844fce7f4db8fe4a00d',
      });

      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Unable to get permission to notify.');
        }
      });

      const messaging = firebase.messaging(); // eslint-disable-line

      messaging.usePublicVapidKey('BLv-Hs91-84lkX0WZ0sF31gQLPtmnNHaYQnHUs5_PxLnefuPblLTIyhcVjxzFNE_DbqpI2RvJQb06ublyQ1PrYo');

      navigator.serviceWorker.register('scripts/firebase-messaging-sw.js').then((registration) => {
        messaging.useServiceWorker(registration);
        this.sendPushToken();

        messaging.onTokenRefresh(() => {
          this.sendPushToken();
        });

        messaging.onMessage((payload) => {
          console.log('Message received. ', payload);
        });
      });
    }
  }

  sendPushToken() {
    const userCall = (token) => {
      if (!storageManager.getUserId() || !token) {
        return;
      }

      const userId = storageManager.getUserId();

      userComposer.updateUser({
        userId,
        user: {
          pushToken: token,
        },
        callback: ({ error }) => {
          if (error) {
            console.log(error);
          }
        },
      });
    };

    if (window.cordova) {
      if (!window.FirebasePlugin) {
        return;
      }

      window.FirebasePlugin.getToken((token) => {
        if (token) {
          this.token = token;

          userCall(token);
        }
      }, (error) => {
        console.log(error);
      });
    } else {
      const messaging = firebase.messaging(); // eslint-disable-line

      messaging.getToken().then((token) => {
        this.token = token;

        userCall(token);
      }).catch((error) => {
        console.log(error);
      });
    }
  }
}

const notificationManager = new NotificationManager();

module.exports = notificationManager;
