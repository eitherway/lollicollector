# Lollicollector - small web server to serve/collect images from ESP32 camera projects

Lollicollector is a small web application, which I use for my home automation/private network. It has the following purposes:
- to collect images from my ESP32 camera projects
- act as display for the images collected by the ESP32
- to serve data for [Lollidisplay](https://github.com/eitherway/lollidisplay)
  - short weather status text
  - time of sunset

Before using this project, read the [Caution](#caution) section. Use it only in trusted, secure and controlled environments.

## Caution

This is a private project of me. I am not responsible for any damage caused by using this project.

The website by default doesn't use any transport encryption. Do not use it in production and don't expose it to the Internet (probably also don't expose it to your whole private network).

Further things to consider:
- the application is not configured for production use (basic configuration options are not done for production usage)
- outputs are not properly sanitized
- errors are not properly handled
- `GET /door_camera` just gives out the whole directory content (Regardless of whether files are actually JPEG)
- There are a multitude of attack vectors
- Basically this application wasn't developed for quality, but instead speed.

So don't run in anywhere, unless you know what you're doing.

## Installation

The application needs certain environment variables:
```
AZURE_MAPS_SUBSCRIPTION_KEY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA-aaaaaaaaa
GPS_LAT=47.64329
GPS_LON=-122.13158
```
All three of these are needed for the weather data, and for calculating the sunset.

You also need to create two folders: `uploads` and `uploads/door_camera`.

Then run an `npm install` and `npm run server` (or `npm run server-dev`, if you are using an `.env` file).

A web server should come up at port `5444`.


## Weather Data

The weather data is provided by [Azure Maps](https://azure.microsoft.com/en-us/services/azure-maps/). You need to create an account and get a subscription key. Then you need to set the environment variable `AZURE_MAPS_SUBSCRIPTION_KEY` to the key.

This data is refreshed every 2 hours, which means it should generously stay within the free tier of Azure Maps (12*30=360, free tier 1000).

