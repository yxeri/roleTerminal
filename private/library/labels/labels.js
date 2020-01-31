const override = {};

const labels = {
  General: {
    yes: (override.General && override.General.yes) || {
      en: 'Yes',
    },
    no: (override.General && override.General.no) || {
      en: 'No',
    },
    he: (override.General && override.General.he) || {
      en: 'He/Him',
    },
    they: (override.General && override.General.they) || {
      en: 'They/Them',
    },
    she: (override.General && override.General.she) || {
      en: 'She/Her',
    },
    it: (override.General && override.General.it) || {
      en: 'It',
    },
  },
  Error: {
    general: {
      en: 'Something went wrong',
      se: 'Något gick fel',
    },
  },
  InvalidDataError: {
    general: {
      en: '',
    },
  },
  NotAllowedError: {
    general: {
      en: 'Access denied. You are not allowed to access this function',
    },
  },
  InvalidLengthError: {
    general: {
      en: 'One of the fields are too short/long',
    },
    aliasName: {
      en: 'The name is too short/long',
    },
    description: {
      en: 'The description is too long',
    },
    title: {
      en: 'The title is too long',
    },
    code: {
      en: 'The code is too long',
    },
    text: {
      en: 'The text is too long',
    },
    name: {
      en: 'The name is too long',
    },
    optionalPassword: {
      en: 'The password is too long',
    },
  },
  InvalidCharactersError: {
    general: {
      en: 'One of the fields contain invalid characters',
    },
    name: {
      en: 'The name contains invalid characters',
    },
    code: {
      en: 'The code contains invalid characters',
    },
    protected: {
      en: 'The name is protected. Please try again',
    },
  },
  UserList: {
    offName: (override.UserList && override.UserList.offName) || {
      en: 'OFF name',
    },
    description: (override.UserList && override.UserList.description) || {
      en: 'Intro',
    },
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
    myProfile: (override.Button && override.Button.myProfile) || {
      en: 'Profile',
    },
    openDocument: (override.Button && override.Button.myProfile) || {
      en: 'Document ID search',
    },
    reboot: (override.Button && override.Button.reboot) || {
      en: 'Reboot',
    },
    teamProfile: {
      en: 'Team profile',
    },
  },
  Transaction: {
    failed: (override.Transaction && override.Transaction.failed) || {
      en: 'Failed to complete the action! Try again or contact an administrator.',
      se: 'Lyckades inte utföra kommandot! Försök igen eller kontakta en administratör.',
    },
    wallet: (override.BaseDialog && override.BaseDialog.wallet) || {
      en: 'Payment',
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
    none: (override.BaseDialog && override.BaseDialog.none) || {
      en: '-',
    },
    done: (override.BaseDialog && override.BaseDialog.done) || {
      en: 'Done',
    },
    set: (override.BaseDialog && override.BaseDialog.set) || {
      en: 'Set',
    },
    send: (override.BaseDialog && override.BaseDialog.send) || {
      en: 'Send',
    },
    image: (override.BaseDialog && override.BaseDialog.image) || {
      en: 'Image',
    },
    accessDenied: (override.BaseDialog && override.BaseDialog.accessDenied) || {
      en: 'Access denied',
    },
    search: (override.BaseDialog && override.BaseDialog.search) || {
      en: 'Search',
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
    protectedDoc: (override.LockedDocFileDialog && override.LockedDocFileDialog.protectedDoc) || {
      en: 'Protected file',
    },
  },
  LockedRoomDialog: {
    isLocked: (override.LockedRoomDialog && override.LockedRoomDialog.isLocked) || {
      en: 'is password protected.',
    },
    enterPassword: (override.LockedRoomDialog && override.LockedRoomDialog.enterPassword) || {
      en: 'Enter the password',
    },
    password: (override.LockedRoomDialog && override.LockedRoomDialog.password) || {
      en: 'Password',
    },
    unlock: (override.LockedRoomDialog && override.LockedRoomDialog.unlock) || {
      en: 'Unlock',
      se: 'Lås upp',
    },
    accessDenied: (override.LockedRoomDialog && override.LockedRoomDialog.accessDenied) || {
      en: 'Access denied',
    },
    protectedRoom: (override.LockedRoomDialog && override.LockedRoomDialog.protectedRoom) || {
      en: 'Protected room',
    },
  },
  OpenDocFileDialog: {
    code: (override.OpenDocFileDialog && override.OpenDocFileDialog.code) || {
      en: 'Code/ID',
    },
    openDoc: (override.OpenDocFileDialog && override.OpenDocFileDialog.openDoc) || {
      en: 'Enter the code/ID of the document you want to access',
    },
    doesNotExist: (override.OpenDocFileDialog && override.OpenDocFileDialog.doesNotExist) || {
      en: 'Document does not exist',
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
    createDoc: (override.DocFileDialog && override.DocFileDialog.createDoc) || {
      en: 'Create document',
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
    createAlias: (override.AliasDialog && override.AliasDialog.createAlias) || {
      en: 'Create alias',
    },
  },
  RegisterDialog: {
    info: (override.RegisterDialog && override.RegisterDialog.info) || {
      en: 'Enter your user information.',
    },
    registerUser: (override.RegisterDialog && override.RegisterDialog.registerUser) || {
      en: 'User registration',
    },
    username: (override.RegisterDialog && override.RegisterDialog.username) || {
      en: 'Name [a-z 0-9 -_]',
      se: 'Namn [a-z 0-9 -_]',
    },
    offName: (override.RegisterDialog && override.RegisterDialog.offName) || {
      en: '[OFF] Your name',
      se: '[OFF] Ditt namn',
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
    description: (override.RegisterDialog && override.RegisterDialog.description) || {
      en: 'Introduction',
    },
    usernameLength: (override.RegisterDialog && override.RegisterDialog.usernameLength) || {
      en: 'The user name can be max 40 characters long.',
      se: 'Användarnamnet får max vara 40 tecken långt.',
    },
    passwordLength: (override.RegisterDialog && override.RegisterDialog.passwordLength) || {
      en: 'The password must be at least 3 characters long.',
      se: 'Lösenordet måste vara minst 3 tecken långt.',
    },
    descriptionLength: (override.RegisterDialog && override.RegisterDialog.descriptionLength) || {
      en: 'The description cannot be more than 500 characters',
    },
    invalidCharacters: (override.RegisterDialog && override.RegisterDialog.invalidCharacters) || {
      en: 'Invalid characters in the username. Allowed characters: a-ö 0-9 -_',
      se: 'Otillåtna tecken i användarnamnet. Tillåtna tecken: a-ö 0-9 -_',
    },
    alreadyExists: (override.RegisterDialog && override.RegisterDialog.alreadyExists) || {
      en: 'User already exists.',
    },
    invalidFullName: (override.RegisterDialog && override.RegisterDialog.invalidFullName) || {
      en: 'Invalid off name. Length must be 1-40 characters.',
      se: 'Ej giltigt offnamn. Längden måste vara 1-40 tecken.',
    },
    image: (override.RegisterDialog && override.RegisterDialog.image) || {
      en: 'Profile picture',
    },
    notVerified: (override.RegisterDialog && override.RegisterDialog.notVerified) || {
      en: 'Your user has to be verified. Contact an administrator.',
    },
    choosePronouns: (override.RegisterDialog && override.RegisterDialog.choosePronouns) || {
      en: '--Choose pronouns--',
    },
  },
  RoomDialog: {
    password: (override.RoomDialog && override.RoomDialog.password) || {
      en: '(Optional) Password to access the room',
      se: '(Valfritt) Lösenordet för att komma åt rummet',
    },
    repeatPassword: (override.RoomDialog && override.RoomDialog.repeatPassword) || {
      en: 'Repeat password',
      se: 'Skriv in lösenordet igen',
    },
    roomName: (override.RoomDialog && override.RoomDialog.roomName) || {
      en: 'Room name',
      se: 'Rummets namn',
    },
    changePassword: (override.RoomDialog && override.RoomDialog.changePassword) || {
      en: 'Change password',
      se: 'Ändra lösenordet',
    },
    roomInfo: (override.RoomDialog && override.RoomDialog.roomInfo) || {
      en: 'Room information',
    },
    removePassword: (override.RoomDialog && override.RoomDialog.removePassword) || {
      en: 'Remove password',
      se: 'Ta bort lösenordet',
    },
    invite: (override.RoomDialog && override.RoomDialog.invite) || {
      en: 'Invite user',
    },
    createRoom: (override.RoomDialog && override.RoomDialog.createRoom) || {
      en: 'Create room',
    },
  },
  EditRoomDialog: {
    editRoom: (override.EditRoomDialog && override.EditRoomDialog.editRoom) || {
      en: 'Edit room',
    },
  },
  RoomUpdateDialog: {
    password: (override.RoomUpdateDialog && override.RoomUpdateDialog.newPassword) || {
      en: 'New password',
    },
    repeatPassword: (override.RoomUpdateDialog && override.RoomUpdateDialog.repeatPassword) || {
      en: 'Repeat new password',
    },
    roomName: (override.RoomUpdateDialog && override.RoomUpdateDialog.roomName) || {
      en: 'New name',
    },
  },
  RoomInfo: {
    whisper: (override.RoomInfo && override.RoomInfo.whisper) || {
      en: 'Whisper',
    },
    room: (override.RoomInfo && override.RoomInfo.room) || {
      en: 'Room',
    },
  },
  LoginDialog: {
    username: (override.LoginDialog && override.LoginDialog.username) || {
      en: 'Name',
      se: 'Namn',
    },
    password: (override.LoginDialog && override.LoginDialog.password) || {
      en: 'Password',
      se: 'Lösenord',
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
    users: {
      en: 'Users',
    },
    teams: {
      en: 'Teams',
    },
    rooms: {
      en: 'Rooms',
    },
    following: {
      en: 'Following',
    },
    whispers: {
      en: 'Whispers',
    },
  },
  ForumView: {
    removedForum: (override.ForumView && override.ForumView.removedForum) || {
      en: 'The forum no longer exists.',
      se: 'Forumet existerar inte.',
    },
    likeButton: (override.ForumView && override.ForumView.likeButton) || {
      en: '+1',
    },
    likes: (override.ForumView && override.ForumView.likes) || {
      en: ':)',
    },
    dislikeButton: (override.ForumView && override.ForumView.likeButton) || {
      en: '-1',
    },
    dislikes: (override.ForumView && override.ForumView.dislikes) || {
      en: ':(',
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
    createThread: (override.ForumView && override.ForumView.createThread) || {
      en: '+Thread',
    },
    createPost: (override.ForumView && override.ForumView.createPost) || {
      en: '+Post',
    },
    createSubPost: (override.ForumView && override.ForumView.createSubPost) || {
      en: '+Sub-post',
    },
  },
  ForumDialog: {
    titleLength: (override.ForumDialog && override.ForumDialog.titleLength) || {
      en: 'Title is too long',
    },
    textLength: (override.ForumDialog && override.ForumDialog.textLength) || {
      en: 'Text is too long',
    },
    title: (override.ForumDialog && override.ForumDialog.title) || {
      en: 'Title',
    },
    text: (override.ForumDialog && override.ForumDialog.text) || {
      en: 'Text',
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
      en: 'Move',
      se: 'Flytta',
    },
    changeStyle: (override.MapObject && override.WorldMapView.changeStyle) || {
      en: 'Styling',
    },
    removePosition: (override.MapObject && override.MapObject.removePosition) || {
      en: 'Remove',
    },
    editPosition: (override.MapObject && override.MapObject.editPosition) || {
      en: 'Edit',
    },
  },
  MenuBar: {
    emptyTime: (override.MenuBar && override.MenuBar.emptyTime) || {
      en: '--:--',
    },
    menu: (override.MenuBar && override.MenuBar.menu) || {
      en: 'Menu',
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
  AdminTeamDialog: {
    updateTeam: {
      en: 'Choose an action:',
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
      en: 'Transferring from',
    },
    sendingTo: (override.WalletDialog && override.WalletDialog.sendingTo) || {
      en: 'Transferring to user',
    },
    sendingToTeam: (override.WalletDialog && override.WalletDialog.sendingToTeam) || {
      en: 'Transferring to team',
    },
    transfer: (override.WalletDialog && override.WalletDialog.transfer) || {
      en: 'Transfer',
    },
    teamHas: (override.WalletDialog && override.WalletDialog.teamHas) || {
      en: 'has',
    },
    currency: (override.WalletDialog && override.WalletDialog.currency) || {
      en: '',
    },
    transferFromTeam: (override.WalletDialog && override.WalletDialog.transferFromTeam) || {
      en: 'Use your team\'s wallet. The team will be the sender',
    },
    transferComplete: {
      en: 'Transfer complete!',
    },
  },
  UserDialog: {
    userInfo: (override.UserDialog && override.UserDialog.userInfo) || {
      en: 'User information',
    },
    partOfTeam: (override.UserDialog && override.UserDialog.partOfTeam) || {
      en: 'Teams',
    },
    position: (override.UserDialog && override.UserDialog.position) || {
      en: 'Coordinates',
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
      en: 'Position',
    },
    username: (override.UserDialog && override.UserDialog.username) || {
      en: 'Username',
    },
    password: (override.UserDialog && override.UserDialog.password) || {
      en: 'Password',
    },
    alreadyMember: (override.UserDialog && override.UserDialog.alreadyMember) || {
      en: 'User is already a member of a team or already in the maximum amount of teams',
    },
    teamInviteOk: (override.UserDialog && override.UserDialog.teamInviteOk) || {
      en: 'User has been added to the team',
    },
    leaveTeam: (override.UserDialog && override.UserDialog.leaveTeam) || {
      en: 'Leave team',
    },
  },
  TeamDialog: {
    tag: (override.TeamDialog && override.TeamDialog.tag) || {
      en: 'Short name',
    },
    teamName: (override.TeamDialog && override.TeamDialog.teamName) || {
      en: 'Team name',
    },
    members: (override.TeamDialog && override.TeamDialog.members) || {
      en: 'Members',
    },
    location: (override.TeamDialog && override.TeamDialog.location) || {
      en: 'Location',
    },
    teamNameLength: (override.TeamDialog && override.TeamDialog.teamNameLength) || {
      en: 'The name is too long',
    },
    shortNameLength: (override.TeamDialog && override.TeamDialog.shortNameLength) || {
      en: 'The short name is too long',
    },
    teamInfo: (override.TeamDialog && override.TeamDialog.teamInfo) || {
      en: 'Team information',
    },
    createTeam: (override.TeamDialog && override.TeamDialog.createTeam) || {
      en: 'Create team',
    },
    maxUserTeamLength: (override.TeamDialog && override.TeamDialog.maxUserTeamLength) || {
      en: 'You are already part of the maximum amount of teams',
    },
  },
  PasswordDialog: {
    password: (override.PasswordDialog && override.PasswordDialog.password) || {
      en: 'New password',
    },
    repeatPassword: (override.PasswordDialog && override.RegisterDialog.PasswordDialog) || {
      en: 'Repeat password',
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
  VoiceCommands: {
    viewSwitch: (override.VoiceCommands && override.VoiceCommands.viewSwitch) || {
      en: 'switch',
    },
  },
  InvitationList: {
    receiver: (override.InvitationList && override.InvitationList.receiver) || {
      en: 'Receiver',
    },
  },
  TerminalPage: {
    multipleMatches: (override.TerminalPage && override.TerminalPage.multipleMatches) || {
      en: '$ Multiple matched commands',
    },
    notFound: (override.TerminalPage && override.TerminalPage.notFound) || {
      en: 'command not found',
    },
    programs: (override.TerminalPage && override.TerminalPage.programs) || {
      en: 'Programs',
    },
    abortCommand: (override.TerminalPage && override.TerminalPage.abort) || {
      en: 'abort command',
    },
    typeAbort: (override.TerminalPage && override.TerminalPage.typeAbort) || {
      en: 'Type abort or click to',
    },
    aborted: (override.TerminalPage && override.TerminalPage.aborted) || {
      en: 'You have aborted the running program',
    },
    running: (override.TerminalPage && override.TerminalPage.running) || {
      en: 'Running command',
    },
    completed: (override.TerminalPage && override.TerminalPage.completed) || {
      en: 'Process completed',
    },
    placeholder: (override.TerminalPage && override.TerminalPage.placeholder) || {
      en: 'Enter to see programs',
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
