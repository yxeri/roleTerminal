const override = {};

// try {
//   override = require('../../override/labels'); // eslint-disable-line import/no-unresolved, global-require
// } catch (err) {
//   console.log('Did not find override labels. Using defaults');
// }

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
    createRoom: (override.Button && override.Button.createRoom) || {
      en: 'Create room',
      se: 'Skapa rum',
    },
    createDocument: (override.Button && override.Button.createDocument) || {
      en: 'Create document',
      se: 'Skapa sokument',
    },
    createTeam: (override.Button && override.Button.createTeam) || {
      en: 'Create team',
      se: 'Skapa grupp',
    },
    inviteTeam: (override.Button && override.Button.inviteTeam) || {
      en: 'Invite to team',
      se: 'Bjud in till grupp',
    },
    leaveTeam: (override.Button && override.Button.leaveTeam) || {
      en: 'Leave team',
      se: 'Lämna gruppen',
    },
    message: (override.Button && override.Button.message) || {
      en: 'Message',
      se: 'Meddelande',
    },
    createAlias: (override.Button && override.Button.createAlias) || {
      en: 'Create alias',
      se: 'Skapa alias',
    },
    confirm: (override.Button && override.Button.confirm) || {
      en: 'Confirm',
    },
    edit: (override.Button && override.Button.edit) || {
      en: 'Edit',
    },
  },
  Transaction: {
    failed: (override.Transaction && override.Transaction.failed) || {
      en: 'Failed to complete the action! Try again or contact an administrator.',
      se: 'Lyckades inte utföra kommandot! Försök igen eller kontakta en administratör.',
    },
    wallet: (override.BaseDialog && override.BaseDialog.wallet) || {
      en: 'Transfer currency',
    },
    currency: (override.BaseDialog && override.BaseDialog.currency) || {
      en: 'currency',
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
    ok: (override.BaseDialog && override.BaseDialog.ok) || {
      en: 'OK!',
    },
    change: (override.BaseDialog && override.BaseDialog.change) || {
      en: 'Change',
      se: 'Ändra',
    },
    unknown: (override.BaseDialog && override.BaseDialog.unknown) || {
      en: 'Unknown',
    },
    error: (override.BaseDialog && override.BaseDialog.error) || {
      en: 'Something went wrong',
      se: 'Något gick fel',
    },
    areYouSure: (override.BaseDialog && override.BaseDialog.areYouSure) || {
      en: 'Are you sure?',
    },
    remove: (override.BaseDialog && override.BaseDialog.remove) || {
      en: 'Remove',
    },
    update: (override.BaseDialog && override.BaseDialog.update) || {
      en: 'Update',
    },
    yes: (override.BaseDialog && override.BaseDialog.yes) || {
      en: 'Yes',
    },
    no: (override.BaseDialog && override.BaseDialog.no) || {
      en: 'No',
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
      en: 'The title is too long',
    },
    codeLength: (override.DocFileDialog && override.DocFileDialog.codeLength) || {
      en: 'The code is too long',
    },
    textLength: (override.DocFileDialog && override.DocFileDialog.textLength) || {
      en: 'The text is too long',
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
    alreadyExists: (override.RegisterDialog && override.RegisterDialog.alreadyExists) || {
      en: 'User already exists',
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
    username: (override.LoginDialog && override.LoginDialog.username) || {
      en: 'Your username',
      se: 'Ditt användarnamn',
    },
    password: (override.LoginDialog && override.LoginDialog.password) || {
      en: 'Your password',
      se: 'Ditt lösenord',
    },
    login: (override.LoginDialog && override.LoginDialog.login) || {
      en: 'Login',
      se: 'Logga in',
    },
    register: (override.LoginDialog && override.LoginDialog.register) || {
      en: 'Register',
      se: 'Registrera',
    },
    incorrect: (override.LoginDialog && override.LoginDialog.incorrect) || {
      en: 'Incorrect username or password. Try again.',
      se: 'Fel användarnamn eller lösenord. Försök igen.',
    },
    banned: (override.LoginDialog && override.LoginDialog.banned) || {
      en: 'The user has been banned.',
    },
    unverified: (override.LoginDialog && override.LoginDialog.unverified) || {
      en: 'The user has not been verified. Contact an administrator.',
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
  StatusBar: {
    menu: (override.StatusBar && override.StatusBar.menu) || {
      en: 'Menu',
      se: 'Meny',
    },
    emptyTime: (override.StatusBar && override.StatusBar.emptyTime) || {
      en: '--:--',
    },
  },
  AdminUserDialog: {
    ban: (override.AdminUserDialog && override.AdminUserDialog.ban) || {
      en: 'Ban',
    },
    unban: (override.AdminUserDialog && override.AdminUserDialog.unban) || {
      en: 'Unban',
    },
    verify: (override.AdminUserDialog && override.AdminUserDialog.verify) || {
      en: 'Verify',
    },
    updateUser: (override.AdminUserDialog && override.AdminUserDialog.updateUser) || {
      en: 'Choose an action:',
    },
    password: (override.AdminUserDialog && override.AdminUserDialog.password) || {
      en: 'Reset password',
      se: 'Återställ lösenordet',
    },
    newPassword: (override.AdminUserDialog && override.AdminUserDialog.newPassword) || {
      en: 'The new password:',
      se: 'Det nya lösenordet:',
    },
    chooseAccess: (override.AdminUserDialog && override.AdminUserDialog.chooseAccess) || {
      en: 'Choose an access level:',
    },
    access: (override.AdminUserDialog && override.AdminUserDialog.access) || {
      en: 'Change permissions',
    },
    walletAmount: (override.WalletDialog && override.WalletDialog.walletAmount) || {
      en: 'Enter the amount that you want to transfer to the wallet. It will be magically created and will not be deducted from your wallet and won\'t show up in the user\'s transaction list.',
    },
  },
  WalletDialog: {
    walletAmount: (override.WalletDialog && override.WalletDialog.walletAmount) || {
      en: 'Enter the amount that you want to transfer.',
    },
    amountPlaceholder: (override.WalletDialog && override.WalletDialog.amountPlaceholder) || {
      en: 'Enter amount',
    },
    sendAmount: (override.WalletDialog && override.WalletDialog.sendAmount) || {
      en: 'Transfer',
    },
    youHave: (override.WalletDialog && override.WalletDialog.youHave) || {
      en: 'You have',
    },
    sendingFrom: (override.WalletDialog && override.WalletDialog.sendingFrom) || {
      en: 'Using wallet for',
    },
    sendingTo: (override.WalletDialog && override.WalletDialog.sendingTo) || {
      en: 'You are transferring to user',
    },
    sendingToTeam: (override.WalletDialog && override.WalletDialog.sendingToTeam) || {
      en: 'You are transferring to team',
    },
  },
  UserDialog: {
    userInfo: (override.UserDialog && override.UserDialog.userInfo) || {
      en: 'User information',
    },
    partOfTeam: (override.UserDialog && override.UserDialog.partOfTeam) || {
      en: 'Part of teams',
    },
    position: (override.UserDialog && override.UserDialog.position) || {
      en: 'Tracking coordinates',
    },
    lastSeenAt: (override.UserDialog && override.UserDialog.lastSeenAt) || {
      en: 'Last seen at',
    },
    amountPlaceholder: (override.UserDialog && override.UserDialog.amountPlaceholder) || {
      en: 'Enter amount',
    },
    sendAmount: (override.UserDialog && override.UserDialog.sendAmount) || {
      en: 'Transfer',
    },
    youHave: (override.UserDialog && override.UserDialog.youHave) || {
      en: 'You have',
    },
    sendingTo: (override.UserDialog && override.UserDialog.sendingTo) || {
      en: 'You are transferring to user',
    },
    sendingToTeam: (override.UserDialog && override.UserDialog.sendingToTeam) || {
      en: 'You are transferring to team',
    },
    trackPosition: (override.UserDialog && override.UserDialog.trackPosition) || {
      en: 'Track user',
    },
    username: (override.UserDialog && override.UserDialog.username) || {
      en: 'Username',
    },
  },
  TeamDialog: {
    tag: (override.TeamDialog && override.TeamDialog.tag) || {
      en: 'Short name',
    },
    teamName: (override.TeamDialog && override.TeamDialog.teamName) || {
      en: 'Team name',
    },
    teamNameLength: (override.TeamDialog && override.TeamDialog.teamNameLength) || {
      en: 'The name is too long',
    },
    shortNameLength: (override.TeamDialog && override.TeamDialog.shortNameLength) || {
      en: 'The short name is too long',
    },
  },
  TransactionList: {
    amount: (override.TransactionList && override.TransactionList.amount) || {
      en: 'Amount',
    },
    sentFrom: (override.TransactionList && override.TransactionList.sentFrom) || {
      en: 'Sent from',
    },
  },
  MessageDialog: {
    textLength: (override.MessageDialog && override.MessageDialog.textLength) || {
      en: 'The message is too long',
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
