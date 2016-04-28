# roleTerminal
![Build status](https://api.travis-ci.org/yxeri/roleTerminal.svg)

roleTerminal is an initiative to create a platform to be used in-game during LARPs. It has so far been used on two post-apocalyptic LARP events, 
[Blodsband reloaded](http://bbreloaded.se) and [Rex](http://www.rexlajv.se), and will be used at [Ockulta Medborgarbyrån](http://www.ockultamedborgarbyran.com).

## Branches

Master contains the latest stable release. Develop contains the latest unstable release.

## Deployment
There's a container available at [Docker hub](https://hub.docker.com/r/yxeri/roleterminal/). Docker is the preferred method of deployment of the app.

The envar CONFIGPATH has to be set to a valid location for the module [roleHaven-config](https://github.com/yxeri/roleHaven-config) (a fork of your own or one
of the existing ones). It will be installed with npm.

## Configuration

roleTerminal has a separate configuration module, found at roleHaven-config](https://github.com/yxeri/roleHaven-config). 

## Shortcuts
* Tab to show all available commands
* Typing two spaces has the same effect as tab and will show all available commands
* Arrow up and down to go through the command history
* Tab after typing one or more letters to auto-complete it into a command (Example: typing he followed by a tab will output help)
* Typing two spaces has the same effect and will auto-complete (useful for devices without a tab button)
* -help typed after a command will show instructions on how to use it (Example: enterroom -help)

## Development contributors
* Aleksandar Jankovic - [Github](https://github.com/yxeri) [Twitter](https://twitter.com/yxeri)
* Stanislav B - [Github](https://github.com/stanislavb)
