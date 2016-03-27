'use strict';
/* eslint-disable camelcase */

const textTools = require('./textTools');

const usageLine = 'Usage:';
const usageLine_se = 'Användning:';
const exampleLine = 'Example:';
const exampleLine_se = 'Exempel';
const employeeNumber = Math.floor(Math.random() * 120503);
const randomRelay = textTools.createCharString(4, true);
let userName = ''; // eslint-disable-line prefer-const

const help = {
  help: ['Shows a list of available commands'],
  whoami: ['Shows information about the current user'],
  clear: ['Clears the terminal view'],
  msg: [
    'Sends a message to your current room',
    'The room you are in is written out to the left of the marker',
  ],
  broadcast: [
    'Sends a message to all users in all rooms',
    'It will prepend the message with "[ALL]"',
  ],
  follow: [
    'Follows a room and shows you all messages posted in it.',
    'You will get the messages from this room even if it isn\'t your currently selected one',
  ],
  unfollow: ['Stops following a room.'],
  list: [
    'Shows a list of users, rooms or devices which you are allowed to see',
    'You have to input which option you want to list',
  ],
  mode: [
    'Change the input mode. The options are chat or cmd',
    '--Chat mode--',
    'Everything written will be interpreted as chat messages',
    'All commands have to be prepended with / or - Example: -uploadkey',
    '--Cmd mode--',
    'Chat mode is the default mode',
    'Text written will not be automatically be intepreted as chat messages',
    'You have to use "msg" command to type messages Example: msg hello',
    'Commands do not have to be prepended with anything. Example: uploadkey',
  ],
  register: [
    'Registers your user name on the server',
    'This user name will be your identity in the system',
    'The name can only contain letters and numbers (a-z, 0-9)',
    'Don\'t use whitespaces in your name or password!',
  ],
  createroom: [
    'Creates a chat room',
    'The rooms name has to be 1 to 6 characters long',
    'The password is optional',
    'The name can only contain letters and numbers (a-z, 0-9)',
  ],
  myrooms: ['Shows a list of all rooms you are following'],
  login: [
    'Logs in as a user on this device',
    'You have to be logged out to login as another user',
  ],
  time: ['Shows the current time'],
  locate: [
    'Shows the last known location of the user',
    '* is a shortcut for all users. Example: locate *',
    'Just writing the command without a user name will show your current location. Example: locate',
    'You need to be connected to the satellites to access this command',
  ],
  history: [
    'Clears the screen and retrieves chat messages from server',
    'The amount you send with the command is the amount of messages that will be returned from each room you follow',
    'You can retrieve history from a specific room by adding the room name to the input. Example: history room1',
  ],
  morse: ['Sends a morse encoded message (sound) to all users'],
  password: [
    'Allows you to change the user password',
    'Don\'t use whitespace in your password!',
  ],
  logout: ['Logs out from the current user on this device'],
  reboot: ['Reboots terminal'],
  verifyuser: [
    'Verifies a user and allows it to connect to the system',
    'verifyuser without any additional input will show a list of all unverified users. Exempel: verifyuser',
    'Use "*" to verify all users',
  ],
  banuser: [
    'Bans a user and disconnects it from the system',
    'The user will not be able to log on again',
  ],
  unbanuser: [
    'Removes ban on user',
    'The user will be able to log on again',
    'unbanuser without any additional input will show a list of all banned users. Example: unbanuser',
  ],
  whisper: [
    'Send a private message to a user',
    'The first word that you type will be interpreted as a user name',
    'The rest of the input will be sent to only that user',
  ],
  hackroom: [
    'ERROR. UNAUTHORIZED COMMAND... AUTHORIZATION OVERRIDDEN. PRINTING INSTRUCTIONS',
    'This command lets you follow a room without knowing the password',
    'It will also supress the following notification',
    'Failing the hack will warn everyone in the room',
  ],
  importantmsg: ['Send an important message to a single device or all users'],
  chipper: [
    'Activate chipper function',
    'Press enter when you have retrieved confirmation from the external system',
  ],
  room: [
    'Switches your current room to another',
    'You have to already be following the room to switch to it',
  ],
  removeroom: [
    'Removes a room',
    'You have to be either the owner or an admin of the room to remove it',
  ],
  updateuser: [
    'Change fields on a user',
    'You can change visibility, accesslevel, password or add/remove a group',
    'Valid fields: visibility, accesslevel, addgroup, removegroup, password',
  ],
  updatecommand: [
    'Change fields on a command',
    'You can currently change visibility or accesslevel',
    'Valid fields: visibility, accesslevel',
  ],
  updateroom: [
    'Change fields on a room',
    'You can change visibility, accesslevel',
    'Valid fields: visibility, accesslevel',
  ],
  weather: ['Shows the weather'],
  updatedevice: [
    'Change fields on a device',
    'You can currently change the alias',
    'Valid fields: alias',
  ],
  createmission: ['Create mission'],
  createteam: [
    'Create a new team',
    'You will be able to invite new members to the team',
  ],
  invitations: [
    'Shows a list of all your invitations and lets you accept or decline them',
    'Note that "d" is a shorthand for "decline" and "a" is a shorthand for "accept" Either version is allowed',
  ],
  inviteteam: [
    'Invites another user to your team',
    'You have to be the team leader or an team administrator to invite new members',
  ],
  inviteroom: ['Invites another user to a room you are following'],
  alias: [
    'Create a new shortcut for a command and sequence',
    'The shortcut will appear among other commands when you auto-complete',
    'The below example "hello" will use command "msg" to send the chat message "Greetings to all!"',
  ],
  verifyteam: [
    'Verifies a team and allows it to be used in the system',
    'verifyteam without any additional input will show a list of all unverified teams. Exempel: verifyteam',
    'Use "*" to verify all teams',
  ],
  settings: [
    'Local settings for the terminal',
    'This should only be used on off-game terminals',
    'It might change behaviour and looks that will make the terminal look more off-game',
    'Available settings:',
    'fastmode - removes flavour text and speeds up print',
  ],
};

const help_se = {
  help: ['Visa en lista av tillgängliga kommandon'],
  whoami: ['Visar information om nuvarande användaren'],
  clear: ['Rensar terminalvyn'],
  msg: [
    'Skickar ett meddelande till ert nuvarande rum',
    'Rummet ni är inne i står skrivet längst ner till vänster om markören',
  ],
  broadcast: [
    'Skicka ett meddelande till alla användare i alla rum',
    '"[ALL"] kommer att läggas till i början av meddelandet',
  ],
  follow: [
    'Följer ett rum och visar alla meddelande som skrivs i det',
    'Ni kommer att få alla meddelande som skickas i detta rum även om ni har ett annat valt som ert nuvarande rum',
  ],
  unfollow: ['Slutar följa ett rum'],
  list: [
    'Visar en list över användare, rum eller enheter som ni har tillåtelse att se',
    'Ni måste skriva in vilken typ ni vill lista',
  ],
  register: [
    'Registrerar ert användarnamn på servern',
    'Detta användarnamn kommer vara er identitet i systemet',
    'Namnet kan endast innehålla bokstäver och siffror (a-z, 0-9)',
    'Använd inte blanksteg i ert namn eller lösenord!',
  ],
  createroom: [
    'Skapar ett chatrum',
    'Rummets namn måste vara 1 till 6 tecken långt',
    'Namnet får endast innehålla bokstäver och siffror (a-z, 0-9)',
  ],
  myrooms: ['Visar en lista över alla rum som ni följer'],
  login: [
    'Loggar in som en användare på denna enhet',
    'Ni måste vara utloggade för att kunna logga in som en annan användare',
  ],
  time: ['Visar nuvarande tiden'],
  locate: [
    'Visar senaste identifierade position för användaren',
    '* är en genväg för alla användare. Exempel: locate *',
    'Om ni bara skriver kommandot utan ett användarnamn så kommer det visa er nuvarande position. Exempel: locate',
    'Ni måste vara uppkopplade mot satelliterna för att ha tillgång till detta kommando',
  ],
  history: [
    'Rensar skärmen och hämtar chatmeddelanden från servern',
    'Om ni skriver med ett värde så kommer servern skicka tillbaka så många meddelanden från varje rum ni följer',
    'Ni kan hämta meddelanden från ett specifikt rum om ni skriver med namnet. Exempel: history rum1',
  ],
  morse: ['Skicka ett meddelande via morse (ljud) till alla användare'],
  password: [
    'Tillåter er att ändra ert lösenord',
    'Använd inte blanksteg i lösenordet!',
  ],
  logout: ['Loggar ut din nuvarande användare från denna enhet'],
  reboot: ['Startar om terminalen'],
  verifyuser: [
    'Verifiera en användare och tillåter denne att koppla upp sig mot systemet',
    'verifyuser utan några andra tillägg visar en lista över alla icke-verifierade användare. Exempel: verifyuser',
    'Använd "*" för att verifiera alla icke-verifierade användare',
  ],
  banuser: [
    'Bannar användaren och kopplar från denne från systemet',
    'Användaren kommer inte kunna logga in igen',
  ],
  unbanuser: [
    'Tar bort en banning från en användare',
    'Användaren kommer kunna logga in igen',
    'unbanuser utan tillägg visar en lista över alla bannade användare. Example: unbanuser',
  ],
  whisper: [
    'Skicka ett privat meddelande till en användare',
    'Det första ni skriver in kommer att tolkas som användarnamnet',
    'Resten kommer att skickas som ett meddelande som endast den användaren kan läsa',
  ],
  hackroom: [
    'FEL. EJ BEHÖRIGT KOMMANDO... KRINGÅR BEHÖRIGHET. SKRIVER UT INSTRUKTIONER',
    'Detta kommando låter dig följa rum utan att veta dess lösenord',
    'Det kommer att stoppa notifikationen som vanligtvis skickas till rum',
    'Alla i rummet kommer bli notifierade om ni misslyckas med hackningen',
  ],
  importantmsg: ['Skicka ett viktigt meddelande till en enhet eller alla användare'],
  chipper: [
    'Aktivera chipperfunktionen',
    'Tryck på enter-knappen när ni har fått konfirmation från externa systemet',
  ],
  room: [
    'Byter nuvrande rum till ett annat',
    'Ni måste redan följa rummet för att kunna byta till det',
  ],
  removeroom: [
    'Tar bort ett rum',
    'Ni måste vara antingen ägaren eller en administratör av rummet för att kunna ta bort det',
  ],
  updateuser: [
    'Ändra ett fält hos en användare',
    'Ni kan ändra visibility, accesslevel, password eller lägga till/ta bort en grupp',
    'Giltiga fält: visibility, accesslevel, addgroup, removegroup, password',
  ],
  updatecommand: [
    'Ändra ett fält i ett kommando',
    'Ni kan ändra visibility eller accesslevel',
    'Giltiga fält: visibility, accesslevel',
  ],
  updateroom: [
    'Ändra ett fält på ett rum',
    'Ni kan ändra visibility, accesslevel',
    'Giltiga fält: visibility, accesslevel',
  ],
  weather: ['Visar vädret'],
  updatedevice: [
    'Ändra fält på en enhet',
    'Ni kan ändra alias',
    'Giltiga fält: alias',
  ],
  createmission: ['Skapa ett uppdrag'],
  createteam: [
    'Skapa ett nytt team',
    'Ni kommer att kunna bjuda in nya medlemmar till teamet',
  ],
  invitations: [
    'Visar en lista över dina inbjudan och låter dig acceptera eller avböja dem',
    'Notera att "d" är en förkortning av "decline" och "a" är en förkortning "accept" Bägge är tillåtna',
  ],
  inviteteam: [
    'Bjuder in andra användare till ditt team',
    'Ni måste vara ledare för teamet eller en administratör för teamet för att kunna bjuda in nya medlemmar',
  ],
  inviteroom: ['Bjuder in en annan användare till ett rum ni följer'],
  alias: [
    'Skapa en ny genväg för ett kommando och en sekvens',
    'Genvägen kommer att synas tillsammans med andra kommandon när ni använder autoifyllning',
    'Nedan kan ni se ett exempel som skickar ett meddelande (via kommandot "msg") när "hello" körs',
  ],
  verifyteam: [
    'Verifiera ett team och tillåter det att användas i systemet',
    'verifyteam utan några andra tillägg visar en lista över alla icke-verifierade användare. Exempel: verifyteam',
    'Använd "*" för att verifiera alla icke-verifierade team',
  ],
  settings: [
    'Lokala inställningar för terminalen',
    'Settings borde endast användas på off-gameterminaler',
    'Det kan ändra beteende och utseende som kan få terminalen att se mer off-game ut',
    'Tillgängliga inställningar:',
    'fastmode - tar bort flavour text och ökar farten på utskriften',
  ],
};

const instructions = {
  help: [
    usageLine,
    'help',
    exampleLine,
    'help',
  ],
  msg: [
    usageLine,
    'msg *message',
    exampleLine,
    'msg Hello!',
  ],
  broadcast: ['Follow the on-screen instructions'],
  follow: [
    usageLine,
    'follow *room name*',
    exampleLine,
    'follow room1',
  ],
  unfollow: [
    usageLine,
    'unfollow *room name*',
    exampleLine,
    'unfollow room1',
  ],
  list: [
    usageLine,
    'list *type*',
    exampleLine,
    'list rooms',
    'list users',
    'list devices',
  ],
  mode: [
    usageLine,
    'mode *mode*',
    exampleLine,
    'mode chat',
    'mode cmd',
  ],
  register: [
    usageLine,
    'register *user name*',
    exampleLine,
    'register myname',
  ],
  createroom: [
    usageLine,
    'createroom *room name*',
    exampleLine,
    'createroom myroom banana',
  ],
  login: [
    usageLine,
    'login *user name*',
    exampleLine,
    'login user11',
  ],
  locate: [
    usageLine,
    'locate *optional user name OR "*"*',
    exampleLine,
    'locate user1',
    'locate *',
    'locate',
  ],
  history: [
    usageLine,
    'history *optional number*',
    'history *optional room name* *optional number*',
    exampleLine,
    'history',
    'history 25',
    'history aroom 25',
    'history aroom',
  ],
  morse: [
    usageLine,
    'morse *message*',
    exampleLine,
    'morse sos',
  ],
  password: ['Follow the instructions on the screen'],
  verifyuser: [
    usageLine,
    'verifyuser',
    'verifyuser *username*',
    'verifyuser *',
    exampleLine,
    'verifyuser',
    'verifyuser appl1',
    'verifyuser *',
  ],
  banuser: [
    usageLine,
    'banuser *username*',
    exampleLine,
    'banuser evil1',
  ],
  unbanuser: [
    usageLine,
    'unbanuser *optional username*',
    exampleLine,
    'unbanuser',
    'unbanuser evil1',
  ],
  whisper: [
    usageLine,
    'whisper *user name* *message*',
    exampleLine,
    'whisper adam hello, adam!',
    'whisper user1 sounds good!',
  ],
  hackroom: [
    usageLine,
    'hackroom *room name*',
    exampleLine,
    'hackroom secret',
  ],
  importantmsg: [
    'Follow the on-screen instructions',
    'Note! Only the first line can be sent as morse code (optional)',
  ],
  chipper: ['Follow the instructions on the screen'],
  room: [
    usageLine,
    'room *room you are following*',
    exampleLine,
    'room room1',
  ],
  removeroom: [
    usageLine,
    'removeroom *room name*',
    exampleLine,
    'removeroom room1',
  ],
  updateuser: [
    usageLine,
    'updateuser *user name* *field name* *value*',
    exampleLine,
    'updateuser user1 accesslevel 3',
    'updateuser user1 group hackers',
  ],
  updatecommand: [
    usageLine,
    'updatecommand *command name* *field name* *value*',
    exampleLine,
    'updatecommand help accesslevel 3',
    'updatecommand help visibility 6',
  ],
  updateroom: [
    usageLine,
    'updateroom *room name* *field name* *value*',
    exampleLine,
    'updateroom user1 accesslevel 3',
  ],
  updatedevice: [
    usageLine,
    'updatedevice *device ID* *field name* *value*',
    exampleLine,
    'updatedevice 32r23rj alias betteralias',
  ],
  createmission: ['Follow the on-screen instructions'],
  createteam: [
    usageLine,
    'createteam *name*',
    exampleLine,
    'createteam team1',
  ],
  invitations: [
    usageLine,
    'invitations',
    '*number of the invitation* *accept OR a OR decline OR d*',
    exampleLine,
    'invitations',
    '1 accept',
  ],
  inviteteam: [
    usageLine,
    'inviteteam *user name*',
    exampleLine,
    'inviteteam user1',
  ],
  inviteroom: [
    usageLine,
    'inviteroom *user name* *room name*',
    exampleLine,
    'inviteroom user1 room1',
  ],
  alias: [
    usageLine,
    'alias *alias name* *command name* *sequence*',
    exampleLine,
    'alias hello msg Greetings to all!',
  ],
  helpExtra: [
    'Instructions',
    'Add -help after a command to get instructions on how to use it. Example: uploadkey -help',
    'Shortcuts',
    'Use page up/down to scroll the view',
    'Press arrow up/down to go through your previous used commands',
    'Pressing tab or space twice will auto-complete any command you have begun writing.',
    'Example: "he" and a tab / double space will automatically turn into "help"',
  ],
  verifyteam: [
    usageLine,
    'verifyteam',
    'verifyteam *team name*',
    'verifyteam *',
    exampleLine,
    'verifyteam',
    'verifyteam Appl 1',
    'verifyteam *',
  ],
  settings: [
    usageLine,
    'settings *setting* *value*',
    exampleLine,
    'settings fastmode on',
    'settings fastmode off',
  ],
};

const instructions_se = {
  help: [
    usageLine_se,
    'help',
    exampleLine_se,
    'help',
  ],
  msg: [
    usageLine_se,
    'msg *meddelande*',
    exampleLine_se,
    'msg Hej!',
  ],
  broadcast: ['Följ instruktionerna som ges'],
  follow: [
    usageLine_se,
    'follow *rumsnamn*',
    exampleLine_se,
    'follow rum1',
    'follow rum2',
  ],
  unfollow: [
    usageLine_se,
    'unfollow *rumsnamn*',
    exampleLine_se,
    'unfollow rum1',
  ],
  list: [
    usageLine_se,
    'list *typ*',
    exampleLine_se,
    'list rooms',
    'list users',
    'list devices',
  ],
  mode: [
    usageLine_se,
    'mode *läge*',
    exampleLine_se,
    'mode chat',
    '-mode cmd',
  ],
  register: [
    usageLine_se,
    'register *användarnamn*',
    exampleLine_se,
    'register myname',
  ],
  createroom: [
    usageLine_se,
    'createroom *rumsnamn*',
    exampleLine_se,
    'createroom myroom',
  ],
  login: [
    usageLine_se,
    'login *användarnamn*',
    exampleLine_se,
    'login user11',
  ],
  locate: [
    usageLine_se,
    'locate *frivilligt användarnamn ELLER "*"*',
    exampleLine_se,
    'locate user1',
    'locate *',
    'locate',
  ],
  history: [
    usageLine_se,
    'history *frivilligt nummer*',
    'history *frivilligt rumsnamn* *frivilligt nummer*',
    exampleLine_se,
    'history',
    'history 25',
    'history aroom',
    'history aroom 25',
  ],
  morse: [
    usageLine_se,
    'morse *meddelande*',
    exampleLine_se,
    'morse sos',
  ],
  password: ['Följ instruktionerna på skärmen'],
  verifyuser: [
    usageLine_se,
    'verifyuser *frivilligt användarnamn ELLER "*"*',
    exampleLine_se,
    'verifyuser',
    'verifyuser appl1',
    'verifyuser *',
  ],
  banuser: [
    usageLine_se,
    'banuser *användarnamn*',
    exampleLine_se,
    'banuser evil1',
  ],
  unbanuser: [
    usageLine_se,
    'unbanuser *frivilligt användarnamn*',
    exampleLine_se,
    'unbanuser',
    'unbanuser evil1',
  ],
  whisper: [
    usageLine_se,
    'whisper *användarnamn* *meddelande*',
    exampleLine_se,
    'whisper ada Hej, Ada!',
    'whisper user1 Låter bra!',
  ],
  hackroom: [
    usageLine_se,
    '  hackroom *rumsnamn*',
    exampleLine_se,
    '  hackroom secret',
  ],
  importantmsg: [
    'Följ instruktionerna på skärmen',
    'Notera att endast första raden skickas som morse (frivilligt)',
  ],
  chipper: ['Följ instruktionerna på skärmen'],
  room: [
    usageLine_se,
    'room *rumsnamn på ett rum ni följer',
    exampleLine_se,
    'room room1',
  ],
  removeroom: [
    usageLine_se,
    'removeroom *rumsnamn*',
    exampleLine_se,
    'removeroom room1',
  ],
  updateuser: [
    usageLine_se,
    'updateuser *användarnamn* *fältnamn* *värde',
    exampleLine_se,
    'updateuser user1 accesslevel 3',
    'update user1 group hackers',
  ],
  updatecommand: [
    usageLine_se,
    'updatecommand *kommandonamn* *fältnamn* *värde*',
    exampleLine_se,
    'updatecommand help accesslevel 3',
    'updatecommand help visibility 6',
  ],
  updateroom: [
    usageLine_se,
    'updateroom *rumsnamn* *fältnamn* *värde*',
    exampleLine_se,
    'updateroom user1 accesslevel 3',
  ],
  updatedevice: [
    usageLine_se,
    'updatedevice *enhets-ID* *fältnamn* *värde*',
    exampleLine_se,
    'updatedevice 32r23rj alias betteralias',
  ],
  createmission: ['Följ instruktionerna på skärmen'],
  createteam: [
    usageLine_se,
    'createteam *namn*',
    exampleLine_se,
    'createteam team1',
  ],
  invitations: [
    usageLine_se,
    'invitations',
    '*nummer på inbjudan* *accept ELLR a ELLER decline ELLER d*',
    exampleLine_se,
    'invitations',
    '1 accept',
  ],
  inviteteam: [
    usageLine_se,
    'inviteteam *användarnamn*',
    exampleLine_se,
    'inviteteam user1',
  ],
  inviteroom: [
    usageLine_se,
    'inviteroom *användarnamn* *rumsnamn*',
    exampleLine_se,
    'inviteroom user1 room1',
  ],
  alias: [
    usageLine_se,
    'alias *namn* *kommandonamn* *sekvens*',
    exampleLine_se,
    'alias hello msg God dag, folket!',
  ],
  helpExtra: [
    'Instruktioner',
    'Lägg till -help efter ett kommando för att få instruktioner på hur det kan användas. Exempel: uploadkey -help',
    'Genvägar',
    'Använd page up/down för att skrolla vyn',
    'Använd pil upp/ner för att gå igenom tidigare använda kommandon',
    'Tryck på tab-knappen eller två mellanslag i rad för att autoifylla kommandon som ni har börjat skriva',
    'Exempel: "he" och en tabbning / två mellanslag i rad kommer automatiskt ändra det till "help"',
  ],
  verifyteam: [
    usageLine_se,
    'verifyteam *frivilligt teamnamn ELLER "*"*',
    exampleLine_se,
    'verifyteam',
    'verifyteam Appl 1',
    'verifyteam *',
  ],
  settings: [
    usageLine_se,
    'settings *inställning* *värde*',
    exampleLine_se,
    'settings fastmode on',
    'settings fastmode off',
  ],
};

const errors = {
  commandFail: ['command not found. Use msg command if you meant to send a message. Press tab or type two spaces to see available commands'],
  aborted: ['Aborting command'],
  noTracking: [
    'Unable to connect to the tracking satellites',
    'Turning off tracking is a major offense',
    'Organica Re-Education Squads have been sent to scour the area',
  ],
  failedRoom: [
    'Failed to create room',
    'Room name has to be 1 to 6 characters long',
    'The room name can only contain letters and numbers (a-z, 0-9)',
    'Example: createroom myroom',
  ],
  invalidSetting: ['Invalid setting'],
  settingUsage: [
    'You have to type the name of the setting and value',
    'Exemple: settings fastmode on',
  ],
};

const errors_se = {
  commandFail: ['Kommandot kunde inte hittas. Använd msg-kommandot om ni menade att skicka ett meddelande. Tryck på tab-knappen eller skriv in två blanksteg för att se tillgängliga kommandon'],
  aborted: ['Avbryter kommandot'],
  noTracking: [
    'Misslyckades med att koppla upp mot spårningsatelliterna',
    'Att slå av spårningsfunktionen är en grov förseelse',
    'Organica omskolningsstyrkor har blivit skickade till området',
  ],
  failedRoom: [
    'Misslyckades att skapa rummet',
    'Rummets namn måste vara 1 till 6 tecken långt',
    'Rummets namn kan endast innehålla bokstäver och siffror (a-z, 0-9)',
    'Exempel: createroom myroom',
  ],
  invalidSetting: ['Ogiltig inställning'],
  settingUsage: [
    'Ni måste skriva in namnet på inställningen och värdet',
    'Exempel: settings fastmode on',
  ],
};

const info = {
  cancel: ['You can cancel out of the command by typing "exit" or "abort"'],
  mustRegister: [
    'You must register a new user or login with an existing user to gain access to more commands',
    'Use command register or login',
    'example: register myname',
    'or login myname',
  ],
  welcomeLoggedIn: [
    `Welcome, employee ${userName}`,
    'Did you know that you can auto-complete commands by using the tab button or writing double spaces?',
    'You can also retrieve instructions if you use the tab button or type double space without any other input',
    'Learn this valuable skill to increase your productivity!',
    'May you have a productive day',
  ],
  razorHacked: ['## This terminal has been cracked by your friendly Razor team. Enjoy! ##'],
  welcome: [
    'Welcome to the Oracle of Organica',
    'Please login to start your productive day!',
    'Did you know that you can auto-complete commands by using the tab button or writing double spaces?',
    'You can also retrieve instructions if you use the tab button or type double space without any other input',
    'Learn this valuable skill to increase your productivity!',
  ],
  pressEnter: ['Press enter to continue'],
  typeLineEnter: [
    'Type a line and press enter',
    'Press enter without any input when you are completely done with the message',
  ],
  keepShortMorse: ['Try to keep the first line short if you want to send it as morse'],
  isThisOk: ['Is this OK? "yes" to accept the message'],
  preview: ['Preview of the message:'],
  sendMorse: [
    'Do you want to send it as morse code too? "yes" to send it as morse too',
    'Note! Only the first line will be sent as morse',
  ],
  congratulations: [
    `Congratulations, employee #${employeeNumber}`,
    'Welcome to the Organica Oracle department',
  ],
  establishConnection: [
    textTools.createFullLine(),
    'Connecting... Could not establish connection to HQ',
    `Rerouting... Secondary relay ${randomRelay} found`,
    `Connecting to relay ${randomRelay}... Connection established`,
    textTools.createFullLine(),
  ],
  hackRoomIntro: [
    'Razor proudly presents:',
    'Room Access Hacking! (RAH)',
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    textTools.createMixedString(40),
    ' ',
    'Please wait.......',
    'Command interception.........ACTIVATED',
    'Oracle defense systems.......DISABLED',
    'Overriding locks.............DONE',
    'Connecting to database ......DONE',
  ],
  useRegister: [
    textTools.createFullLine(),
    'Use register to register a new user',
    'Use login to log in to an existing user',
    'You have to log in to access most of the system',
    textTools.createFullLine(),
  ],
  whoFrom: [
    'Who is the message from?',
    'You can also leave it empty and just press enter',
  ],
  fastModeOn: [
    'Fast mode is on',
    'Flavour text will be skipped',
    'Speed of print out has been increased',
  ],
  fastModeOff: ['Fast mode is now turned off'],
};

const info_se = {
  cancel_se: ['Ni kan avbryta kommandot genom att skriva "exit" eller "abort"'],
  mustRegister: [
    'Ni måste registrera en ny användare eller logga in me en existerande användare för att få tillgång till fler kommandon',
    'Använd kommando register eller login',
    'Exempel: register myname',
    'eller login myname',
  ],
  welcomeLoggedIn: [
    `Välkommen, uppdragstagare ${userName}`,
    'Visste ni att ni kan autoifylla kommandon genom att trycka på tab-knappen eller skriva in två mellanslag i rad?',
    'Ni kan också trycka på tab-knappen eller skriva in tvåmellanslag i rad för att få fram instruktioner',
    'Lär dig denna värdefulla teknik för att öka din produktivitet!',
    'Ha en produktiv dag',
  ],
  razorHacked: ['## Denna terminal låstes upp av er vänliga Razor-grupp. Ha så kul! ##'],
  welcome: [
    'Välkommen till Oraklet av Organica',
    'Var vänlig och logga in för att starta in produktiva dag!',
    'Visste ni att ni kan autoifylla kommandon genom att trycka på tab-knappen eller skriva in två mellanslag i rad?',
    'Ni kan också trycka på tab-knappen eller skriva in tvåmellanslag i rad för att få fram instruktioner',
    'Lär dig denna värdefulla teknik för att öka din produktivtet!',
    'Ha en bra och produktiv dag',
  ],
  pressEnter: ['Tryck på enter för att fortsätta'],
  typeLineEnter: [
    'Skriv en rad och tryck på enter-knappen',
    'Tryck på enter-knappen utan något i inmatningsfältet när ni är helt klara med meddelandet',
  ],
  keepShortMorse: ['Försök att hålla första raden kort om ni vill skicka meddelandet som morse'],
  isThisOk: ['Är detta OK? Skriv in "yes" för att acceptera meddelandet'],
  preview: ['Förhandsgranskning av meddelandet'],
  sendMorse: [
    'Vill ni också skicka det som morse? Skriv "yes" för att skicka det som morse',
    'Notera att endast första raden skickas som morse',
  ],
  congratulations: [
    `Gratulerar, uppdragstagare #${employeeNumber}`,
    'Välkommen till Organica Orakelavdelningen',
  ],
  establishConnection: [
    textTools.createFullLine(),
    'Ansluter... Kunde inte etablera en anslutning mot HQ',
    `Omdirigerar... Sekundär relä ${randomRelay} funnen`,
    `Ansluter till relä ${randomRelay}... Anslutning etablerad`,
    textTools.createFullLine(),
  ],
  useRegister: [
    textTools.createFullLine(),
    'Använd register för att registrera en ny användare',
    'Använd login för att logga in som en existerande användare',
    'Ni måste logga in för att få tillgång till majoriteten av systemet',
    textTools.createFullLine(),
  ],
  whoFrom: [
    'Vem är detta meddelande från?',
    'Ni kan också lämna det tomt och trycka på enter',
  ],
  fastModeOn: [
    'Fast mode är på',
    'All flavour text hoppas över',
    'Text skrivs ut snabbare',
  ],
  fastModeOff: ['Fast mode är nu avslaget'],
};

module.exports.userName = userName;
module.exports.help = help;
module.exports.help_se = help_se;
module.exports.instructions = instructions;
module.exports.instructions_se = instructions_se;
module.exports.errors = errors;
module.exports.errors_se = errors_se;
module.exports.info = info;
module.exports.info_se = info_se;
