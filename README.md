# Beam

Send a link, a note or a file from your computer to your phone, built on [ntfy](https://ntfy.sh).
No account, no backend, no build step.

```
index.html              the original minimal web app (one file)
concepts/               three animated design directions, sharing one engine
  index.html            gallery with video previews        → /concepts
  lockscreen.html       live phone preview + arc flight    → /concepts/lockscreen
  signal.html           particles, beam and warp           → /concepts/signal
  teleprinter.html      receipt slip fed into a machine    → /concepts/teleprinter
  core.js               config, detection, sending, settings sheet, sound effects, dock
beam                    the same thing as a shell command
mock.mjs                a fake ntfy server for local testing (DELAY=250 node mock.mjs)
vercel.json             clean URLs + cache headers
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

- **Topics are public.** Anyone who knows (or guesses) your topic name can read and send to it, so treat the name like a password. For real privacy, [self-host ntfy](https://docs.ntfy.sh/install/) or reserve a topic with an ntfy.sh account and set an access token in Beam's settings.
- **ntfy.sh free limits:** about 250 messages per day per IP address; attachments up to 15 MB that expire after a few hours.
- **iOS:** notifications arrive through Apple's push service and can take a few seconds.
