const override = require('../../override/labels');
const labels = {
  General: {

  },
  Button: {
    logout: (override.Button && override.Button.logout) || {
      en: 'Log out',
      se: 'Logga ut',
    },
    login: (override.Button && override.Button.login) || {
      en: 'Log in',
      se: 'Logga in',
    },
    register: (override.Button && override.Button.register) || {
      en: 'Register user',
      se: 'Registrera användare',
    },
  },
  BaseDialog: {
    cancel: (override.BaseDialog && override.BaseDialog.cancel) || {
      en: 'Cancel',
      se: 'Avbryt',
    },
    create: (override.BaseDialog && override.BaseDialog.create) || {
      en: 'Create',
      se: 'Skapa',
    },
    notMatchingPassword: (override.BaseDialog && override.BaseDialog.notMatchingPassword) || {
      en: 'Passwords do not match. Try again.',
      se: 'Lösenorden stämmer inte överens. Försök igen.',
    },
  },
  LockedDocFileDialog: {
    unlock: (override.LockedDocFileDialog && override.LockedDocFileDialog.unlock) || {
      en: 'Unlock',
      se: 'Lås upp',
    },
    isLocked: (override.LockedDocFileDialog && override.LockedDocFileDialog.isLocked) || {
      en: 'is locked.',
      se: 'är låst',
    },
    enterCode: (override.LockedDocFileDialog && override.LockedDocFileDialog.enterCode) || {
      en: 'Enter the document code to access it.',
      se: 'Skriv in dokumentets kod för att låsa upp det.',
    },
    incorrectCode: (override.LockedDocFileDialog && override.LockedDocFileDialog.enterCode) || {
      en: 'Incorrect code. Try again.',
      se: 'Fel kod. Försök igen',
    },
  },
  DocFileDialog: {
    title: (override.DocFileDialog && override.DocFileDialog.title) || {
      en: 'Title',
      se: 'Titel',
    },
    code: (override.DocFileDialog && override.DocFileDialog.code) || {
      en: 'Code to access document',
      se: 'Kod för att komma åt dokumentet',
    },
    text: (override.DocFileDialog && override.DocFileDialog.text) || {
      en: 'Text',
    },
    titleLength: (override.DocFileDialog && override.DocFileDialog.titleLength) || {

    },
  },
  AliasDialog: {
    aliasName: (override.AliasDialog && override.AliasDialog.aliasName) || {
      en: 'Alias',
    },
    aliasNameLength: (override.AliasDialog && override.AliasDialog.aliasNameLength) || {
      en: 'Alias must be 2 - 40 characters long',
      se: 'Alias måste vara 2 - 40 tecken långt.',
    },
    fullName: (override.AliasDialog && override.AliasDialog.fullName) || {
      en: 'Full name',
      se: 'Hela namnet',
    },
  },
  RegisterDialog: {
    username: (override.RegisterDialog && override.RegisterDialog.username) || {
      en: 'Username [a-z 0-9 -_]',
      se: 'Användarnamn [a-z 0-9 -_]',
    },
    fullName: (override.RegisterDialog && override.RegisterDialog.fullName) || {
      en: 'Full name [a-z 0-9]',
      se: 'Hela namnet [a-z 0-9]',
    },
    password: (override.RegisterDialog && override.RegisterDialog.password) || {
      en: 'Password',
      se: 'Lösenord',
    },
    repeatPassword: (override.RegisterDialog && override.RegisterDialog.repeatPassword) || {
      en: 'Repeat password',
      se: 'Repetera lösenordet',
    },
    register: (override.RegisterDialog && override.RegisterDialog.register) || {
      en: 'Register user',
      se: 'Skapa användaren',
    },
    exists: (override.RegisterDialog && override.RegisterDialog.exists) || {
      en: 'User already exists.',
      se: 'Användare existerar redan.',
    },
    usernameLength: (override.RegisterDialog && override.RegisterDialog.usernameLength) || {
      en: 'The user name must be be 2 - 40 characters long.',
      se: 'Användarnamnet måste vara 2 - 40 tecken långt.',
    },
    passwordLength: (override.RegisterDialog && override.RegisterDialog.passwordLength) || {
      en: 'The password must be be 4 - 40 characters long.',
      se: 'Lösenordet måste vara 4 - 40 tecken långt.',
    },
    invalidCharacters: (override.RegisterDialog && override.RegisterDialog.invalidCharacters) || {
      en: 'Invalid characters in the username/full name Allowed characters: a-z 0-9 -_',
      se: 'Otillåtna tecken i användarnamnet/hela namnet. Tillåtna tecken: a-z 0-9 -_',
    },
  },
  RoomDialog: {
    password: (override.RoomDialog && override.RoomDialog.invalidCharacters) || {
      en: 'Password to access the room',
      se: 'Lösenordet för att komma åt rummet',
    },
    repeatPassword: (override.RoomDialog && override.RoomDialog.repeatPassword) || {
      en: 'Repeat password',
      se: 'Skriv in lösenordet igen',
    },
    roomName: (override.RoomDialog && override.RoomDialog.roomName) || {
      en: 'Name of the room',
      se: 'Rummets namn',
    },
  },
  LoginDialog: {
    username: (override.RoomDialog && override.RoomDialog.username) || {
      en: 'Your username',
      se: 'Ditt användarnamn',
    },
    password: (override.RoomDialog && override.RoomDialog.password) || {
      en: 'Your password',
      se: 'Ditt lösenord',
    },
    login: (override.RoomDialog && override.RoomDialog.login) || {
      en: 'Login',
      se: 'Logga in',
    },
    register: (override.RoomDialog && override.RoomDialog.register) || {
      en: 'Register',
      se: 'Registrera',
    },
    incorrect: (override.RoomDialog && override.RoomDialog.incorrect) || {
      en: 'Incorrect username or password. Try again.',
      se: 'Fel användarnamn eller lösenord. Försök igen',
    },
  },
  FeedView: {
    messageListTitle: (override.FeedView && override.FeedView.messageListTitle) || {
      en: 'Members',
      se: 'Medlemmar',
    },
  },
  List: {
    removedItem: (override.List && override.List.invalidCharacters) || {
      en: 'The item has been removed.',
      se: 'Raden har raderats.',
    },
  },
  ForumView: {
    removedForum: (override.ForumView && override.ForumView.removedForum) || {
      en: 'The forum no longer exists.',
      se: 'Forumet existerar inte.',
    },
    likeButton: (override.ForumView && override.ForumView.likeButton) || {
      en: '+1',
      se: '+1',
    },
    likes: (override.ForumView && override.ForumView.likes) || {
      en: '',
      se: '',
    },
    timeCreated: (override.ForumView && override.ForumView.timeCreated) || {
      en: 'Created:',
      se: 'Skapad:',
    },
    lastUpdated: (override.ForumView && override.ForumView.lastUpdated) || {
      en: 'Updated:',
      se: 'Uppdaterad:',
    },
    edit: (override.ForumView && override.ForumView.edit) || {
      en: 'Edit',
      se: 'Ändra',
    },
  },
  WorldMapView: {
    noName: (override.WorldMapView && override.WorldMapView.noName) || {
      en: 'Unknown position.',
      se: 'Okänd plats.',
    },
    noDescription: (override.WorldMapView && override.WorldMapView.noDescription) || {
      en: 'No information found.',
      se: 'Ingen information kunde hittas.',
    },
  },
  MapObject: {
    createPosition: (override.MapObject && override.WorldMapView.createPosition) || {
      en: 'Create position',
      se: 'Skapa en plats',
    },
    createPositionName: (override.MapObject && override.WorldMapView.createPositionName) || {
      en: 'Position name',
      se: 'Platsens namn',
    },
    createPositionDescription: (override.MapObject && override.WorldMapView.createPositionDescription) || {
      en: 'Position description',
      se: 'Platsens beskrivning',
    },
    movePosition: (override.MapObject && override.WorldMapView.movePosition) || {
      en: 'Move position',
      se: 'Flytta platsen',
    },
    changeStyle: (override.MapObject && override.WorldMapView.changeStyle) || {
      en: 'Change style',
      se: 'Byt stil',
    },
  },
  TopView: {
    menu: (override.TopView && override.WorldMapView.menu) || {
      en: 'Menu',
      se: 'Meny',
    },
    emptyTime: (override.TopView && override.WorldMapView.emptyTime) || {
      en: '--:--',
    },
  },
};

/**
 * Add new base objects from override, if they don't already exists.
 * You can use this to introduce new objects and create their corresponding labels without having to hardcode them.
 */

const baseKeys = Object.keys(labels);

Object.keys(override).forEach((baseKey) => {
  if (!baseKeys.includes(baseKey)) {
    labels[baseKeys] = override[baseKey];
  }
});

module.exports = labels;
