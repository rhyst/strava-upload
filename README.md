# Strava Uploader

An installable progressive web app (PWA) to serve as a share target for GPX files on Android.

## Usage

- Visit the [web app](https://strava-upload.run.ryty.uk/) on an Android device.
- Install the web app when prompted.
- Open the installed app from your homescreen or app drawer.
- Grant it permission to create activities for you on Strava.
- Open a different app that creates GPX files.
- Share the GPX file to "Strava Uploader" using the Android share menu.
- Fill out a name and description and click upload.

## Running the web app

The application runs as a simple server that server the PWA and handles exchaning tokens with the Strava API.

### Prerequisite

You must create a Strava API application on the Strava website and acquire an API client ID and an API client secret.

###  Dokku

If you have a dokku instance then you can run the server as a Dokku app:

First clone this repo:

```
git clone https://github.com/rhyst/strava-upload.git
cd strava-upload/
```

Then create the Dokku app and configure it with the Strava API client details:

```
dokku apps:create strava-upload
dokku config:set strava-upload APP_URL=strava-upload.{Your dokku domain} CLIENT_ID={Strava API client ID} CLIENT_SECRET={Strava API client secret} SECRET_KEY={32bit key for encrypting auth cookies}
```

The `APP_URL` will normally be a subdomain of your Dokku instance's domain i.e. `strava-upload.my-dokku-instance.com`. The `SECRET_KEY` can be any 32 bit string.

Finally push the code to the Dokku instance:

```
git remote add dokku dokku@{Your dokku domain}:strava-upload
git push dokku master
```