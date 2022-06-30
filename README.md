# 190815160002010211051404

Find summarised content by clicking a button at the top left of this read me.

## Intro

This is a simple backend solution in nodejs using express and axios and can be implemented to use Mongodb Database or firebase...

## Understand why I am public

You can suggest changes, submit PRs or even clone me as a learning step. Trust me, I will save you time, 😉.

## Just a '_by the way_'

> I know you **`cloned`** or **`forked`** me,
>
> > I saved you **`coding`** time. Give me **`the repo`** a star 🌟 as appreciation.
>
> Hope you are done showing the project some appreciation, now it is time for me to help you get started quickly.

## Getting Started

### How to run me

You can start by running the following commands in the cloned project folder:

> Depending on the package management tool you use, either **`yarn`** or **`npm`**.
> Start by either running the commands
>
> For yarn, run: 👇
>
> > ```bash
> > yarn
> > ```
>
> For npm, run: 👇
>
> > ```bash
> > npm install
> > ```
>
> Now lets create a env file to hold our environment secrets.
>
> > Still under the project's root folder, run the following command.
> > Inside it add the following:
> >
> > ```bash
> > mkdir config.env
> > ```
> >
> > Done? Now lets open the file in your text editor and paste in the following (Remember to change respective secrets as text coded.):
> >
> > ```env
> > PORT=5000
> > MONGO_URI=mongodb://localhost:27017/...{the mongo db url, both online or local}
> >
> > JWT_SECRET={your JWT Secret}
> > JWT_EXPIRE=20min
> >
> > EMAIL_SERVICE=SendGrid
> > EMAIL_USERNAME={username as provide by Sendgrid}
> > EMAIL_PASSWORD={password as provided by Sendgrid}
> > EMAIL_FROM={email as provide by sendgrid}
> > ```
> >
> > The file now has all the required secrets.
>
> Done, and it is time to run it! Again depending with the package manager that you are using.
>
> For yarn, run: 👇
>
> > ```bash
> > yarn run server
> > ```
>
> For npm, run: 👇
>
> > ```bash
> > npm run server
> > ```
>
> Hope it ran for you successfuly.

### On success run

The terminal should resemble this image.

## Help?

[![Success Run](/readme/assets/images/general/run_success.png "Run Success, Vs Code by Hik Hik")](https://hik8hik.github.io)

You can find a video tutorial [here](https://youtube.com), or a video explanation on how to get the cloned repo running [here](https://youtube.com).

## Current Contributors

[`Hik HIk`](https://github.com/hik8hik).
