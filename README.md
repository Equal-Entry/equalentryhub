# Welcome to Equal Entry Hub - a fork of Mozilla Hubs Cloud seeking to make it more accessible

This project began in December 2021 as a Equal Entry project collaboration between [Thomas Logan](https://twitter.com/techthomas), [Roland Dubois](https://twitter.com/rdub80), and Owen Wang. We focused on creating a working prototype of new accessibility functionality that can live inside of Mozilla Hubs.  We chose Mozilla Hubs because it is an open source system that allows for open customization and collaboration. We have benefitted greatly from from the advice of the Mozilla Hubs tema and appreciate Mozilla's commitment to making a more accessible world.  

This project is now part of the the 3D Content Descriptions group and part of the Accessible Development of XR [adXR Workstream](https://xraccess.org/workstreams/adxr/) at XRAccess and will be used to demonstrate features that enable people who are blind or low-vision to get information about content that is used within spatial worlds. Our initial project was begun working with intern Owen Wang from Equal Entry to customize Mozilla Hubs and make it more accessible to people who are blind or low vision. 

## Demo Environments
### Empty Room 
In [Empty Room](https://equalentryhub.com/s4tt2eN/empty-space/) we have a large open space comprising a grassy plain surrounded by mountains.  There are no objects in this room so its a great place to start exploring scenarios inside of. 

### Room with Microphone
In [Room with Microphone](https://equalentryhub.com/zCG5RNz/room-with-microphone) we have setup an environment where there is a stage, a microphone to form a line to ask questions, and a social area in the back of the room.


### Classroom for Advanced Scenarios
In [School](https://equalentryhub.com/naFFnpW/school/) the world designed by Christian Van Meurs has three classrooms with different seating layouts. It also has six breakout rooms that can be used for private conversations. This world is beneficial for working on advanced scenarios. 


## Supported Commands

### a11y
The a11y command can be used to get a list of commands that are supported in the current prototype.

`/a11y`

When the values are returned they will equivalent to the documentation that can be found on this site.  Ensure that if you are proposing a new feature to add to the API that it is also documented and srufaced through this command so that it can be discovered by screen reader users.  

### describe 
describe media object, avatar or room information

### fov
/fov - list media objects in user avatar's current field of view


### list
The list command can be used to find objects surrounding your avatar.

list media objects or avatars in this room

 Objects within 6 meters of your avatar will be listed and given a number. You can access these items by using an example command such as 

`/list o 1`

When this command is issued the response will be...

### move
/move - move to specific avatar or object

### nearby
list nearby media object from user avatar's current location

### view
/view - check whether a given media object is in in user avatar's current field of view

## Resources from adXR Community
[Jesse Anderson](https://twitter.com/bgfh79) reviewed the Hubs prototype on his IllegallySighted YouTube channel. 

[![Watch the Walk Through](https://i.imgur.com/0KeWCjf.png)](https://www.youtube.com/watch?v=o2Bo-QwLQRQ)


[Sage Freedman](https://twitter.com/sagefreeman) provided two avatars that we use to assist with testing the implementations.  The Full Occlusion avatar will see nothing on the scree. The Partial Occlusion avatar will experience the environment through a dimmed filter. 
Full Occlusion - https://hubs.mozilla.com/avatars/fn4oj4D
Partial Occlusion - https://hubs.mozilla.com/avatars/V6ewezR

[Christian Van Meurs](https://www.linkedin.com/in/christian-van-meurs-19861321/) created the school environment that we are using to illustrate multiple accessibility principles. Review the [Classroom in Spoke](https://hubs.mozilla.com/spoke/projects/new?sceneId=OojOIa3)

# [Mozilla Hubs](https://hubs.mozilla.com/)

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0) [![Build Status](https://travis-ci.org/mozilla/hubs.svg?branch=master)](https://travis-ci.org/mozilla/hubs) [![Discord](https://img.shields.io/discord/498741086295031808)](https://discord.gg/CzAbuGu)

The client-side code for [Mozilla Hubs](https://hubs.mozilla.com/), an online 3D collaboration platform that works for desktop, mobile, and VR platforms.

[Learn more about Hubs](https://hubs.mozilla.com/docs/welcome.html)

## Working with the Hubs Classroom Model
* Download [Hubs Spoke.glb](https://www.dropbox.com/s/zuld5apu70xen7b/Hubs%20School%20v1.0.glb?dl=0)
* Open **Scene Editor** from [Equal Entry Hub](https://equalentryhub.com/)
* Activate 

## Getting Started

If you would like to run Hubs on your own servers, check out [Hubs Cloud](https://hubs.mozilla.com/docs/hubs-cloud-intro.html).

If you would like to deploy a custom client to your existing Hubs Cloud instance please refer to [this guide](https://hubs.mozilla.com/docs/hubs-cloud-custom-clients.html).

If you would like to contribute to the main fork of the Hubs client please see the [contributor guide](./CONTRIBUTING.md).

If you just want to check out how Hubs works and make your own modifications continue on to our Quick Start Guide.

### Quick Start

[Install NodeJS](https://nodejs.org) if you haven't already. We recommend version 12 or above.

Run the following commands:

```bash
git clone https://github.com/mozilla/hubs.git
cd hubs
npm ci
npm run dev
```

Then visit https://localhost:8080 (note: HTTPS is required, you'll need to accept the warning for the self-signed SSL certificate)

> Note: When running the Hubs client locally, you will still connect to the development versions of our [Janus WebRTC](https://github.com/mozilla/janus-plugin-sfu) and [reticulum](https://github.com/mozilla/reticulum) servers. These servers do not allow being accessed outside of localhost. If you want to host your own Hubs servers, please check out [Hubs Cloud](https://hubs.mozilla.com/docs/hubs-cloud-intro.html).

## Documentation

The Hubs documentation can be found [here](https://hubs.mozilla.com/docs).

## Community

Join us on our [Discord Server](https://discord.gg/CzAbuGu) or [follow us on Twitter](https://twitter.com/MozillaHubs).

## Contributing

Read our [contributor guide](./CONTRIBUTING.md) to learn how you can submit bug reports, feature requests, and pull requests.

We're also looking for help with localization. The Hubs redesign has a lot of new text and we need help from people like you to translate it. Follow the [localization docs](./src/assets/locales/README.md) to get started.

Contributors are expected to abide by the project's [Code of Conduct](./CODE_OF_CONDUCT.md) and to be respectful of the project and people working on it. 

## Additional Resources

* [Reticulum](https://github.com/mozilla/reticulum) - Phoenix-based backend for managing state and presence.
* [NAF Janus Adapter](https://github.com/mozilla/naf-janus-adapter) - A [Networked A-Frame](https://github.com/networked-aframe) adapter for the Janus SFU service.
* [Janus Gateway](https://github.com/meetecho/janus-gateway) - A WebRTC proxy used for centralizing network traffic in this client.
* [Janus SFU Plugin](https://github.com/mozilla/janus-plugin-sfu) - Plugins for Janus which enables it to act as a SFU.
* [Hubs-Ops](https://github.com/mozilla/hubs-ops) - Infrastructure as code + management tools for running necessary backend services on AWS.

## Privacy

Mozilla and Hubs believe that privacy is fundamental to a healthy internet. Read our [privacy policy](./PRIVACY.md) for more info.

## License

Hubs is licensed with the [Mozilla Public License 2.0](./LICENSE)