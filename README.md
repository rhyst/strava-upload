# Strava Uploader

An installable web app to serve as a share target for GPX files on Android.

## Usage

- Visit the [web app](https://fierce-mountain-72165.herokuapp.com/) on an Android device.
- Install the web app when prompted.
- Open the installed app from your homescreen or app drawer.
- Grant it permission to create activities for you on Strava.
- Open a different app that creates GPX files.
- Share the GPX file to "Strava Uploader" using the Android share menu.
- Fill out a name and description and click upload.

## Running the web app

Create a Strava API application.

Then runs the code as a Heroku app:

- heroku create
- heroku config:set -a {Heroku app name} APP_URL={Heroku URL} CLIENT_ID={Strava API client ID} CLIENT_SECRET={Strava API client secret} SECRET_KEY={32bit key for encrypting auth cookies}
- git push heroku master
