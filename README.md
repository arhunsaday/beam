# Beam

Send a link, a note or a file from your computer to your phone, built on [ntfy](https://ntfy.sh).
No account, no backend, no build step.

```
index.html              the page: one URL, four designs, swapped in place
app/main.js             mounts the chosen design and remembers it
app/core.js             config, detection, sending, settings sheet, sound effects
app/designs/            classic, lockscreen, signal, teleprinter (each loaded on demand)
beam                    the same thing as a shell command
mock.mjs                a fake ntfy server for local testing (DELAY=250 node mock.mjs)
vercel.json             security headers
```

## How it works

ntfy is a publish/subscribe service that works over plain HTTP.

1. Your phone subscribes to a **topic**: a name such as `beam-k3f9x2...`.
2. Anything that sends an HTTP POST to `https://ntfy.sh/<topic>` turns into a push notification on that phone.

Beam is a small interface over that one request:

| You send  | Request Beam makes                                  | On your phone                          |
|-----------|-----------------------------------------------------|----------------------------------------|
| A link    | `POST ?click=<url>&title=<domain>&tags=link`        | 🔗 notification; tap it to open the URL |
| Text      | `POST` with the text as the body, `tags=memo`       | 📝 notification with the full text      |
| A file    | `PUT` with the file as the body, `?filename=…`      | 📎 notification; tap it to download     |

## CLI

```sh
cp beam /usr/local/bin/
export BEAM_TOPIC=beam-yourtopic   # add this to ~/.zshrc or ~/.bashrc

beam https://example.com
beam "call mom"
beam -f ~/Downloads/ticket.pdf "boarding pass"
pbpaste | beam
```

## Things to know

- **History stays local.** Everything you send is listed under the clock button (last 7 days by default). It lives in this browser's storage only and never leaves your machine; files are listed by name, not stored.
- **Topics are public.** Anyone who knows (or guesses) your topic name can read and send to it, so treat the name like a password. For real privacy, [self-host ntfy](https://docs.ntfy.sh/install/) or reserve a topic with an ntfy.sh account and set an access token in Beam's settings.
- **ntfy.sh free limits:** about 250 messages per day per IP address; attachments up to 15 MB that expire after a few hours.
- **iOS:** notifications arrive through Apple's push service and can take a few seconds.
