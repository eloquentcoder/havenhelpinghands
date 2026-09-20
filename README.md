# Haven Healing Hands Initiative

The public site and CMS for HHHI, a faith-based non-profit in Abuja, Nigeria.
Next.js (App Router) + Payload 3 + SQLite.

## Images, and the placeholders standing in for them

The owner has not supplied photographs yet, so every picture on the site is
**generated brand artwork** — teal and brass arches derived from the logo's own
geometry, produced by `src/lib/placeholderArt.ts` and uploaded by the seed as
ordinary Media documents.

They are drawings, not photographs, on purpose. A stock or AI photo of a woman
in a clinic, placed on this site, reads as a photograph of someone HHHI
actually helped — a false claim about a real registered charity. A drawing of
an arch claims nothing.

**To replace one, no code change is needed.** In `/admin` → Media, any document
whose filename starts with `hhhi-placeholder-` is a stand-in; its alt text
(which is also its title in the admin list) says so. Upload the real photograph
over it, write proper alt text, and set the focal point. The site picks it up
immediately.

### Where each picture is edited

| On the site | In the admin |
| --- | --- |
| Homepage hero | Globals → Homepage → Hero → Hero image |
| Headers on /programs, /blog, /events | Globals → Page headers |
| A programme's hero and gallery | Programs → *the programme* → Content |
| A post or event cover | Blog & news / Events → *the entry* → Content |
| A picture inside any other page | Pages → *the page* → add an Image or Gallery block |
| Team photos | Team → *the person* → Photo |

A listing page header falls back to the wording written into the page when its
field is left blank, so clearing one restores the default rather than emptying
the band. Uploaded header images sit under a dark teal wash, which keeps the
heading readable whatever the picture.

Note that `npm run seed` regenerates the placeholders and **deletes any media
whose filename still starts with `hhhi-placeholder-`**. It never touches
anything else, so a photograph uploaded under its own name is safe — but the
seed is destructive to programmes, pages and team members generally. Do not run
it against a site the owner has started editing.

## Colour

The brand teal is `#006d77`, sampled from `public/logo.png`. It is
`--color-teal-500` in the `@theme` block of `src/app/(frontend)/styles.css`,
which is the single source of truth for the palette — there is no
`tailwind.config`. Surfaces use `teal-500` (header), `teal-600` (hero and
section bands) and `teal-700` (footer). The `teal-900`/`teal-950` end of the
scale is deliberately not used for large surfaces: it reads as black rather
than as the logo.

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. You'll need to add the `MONGODB_URL` from your Cloud project to your `.env` if you want to use S3 storage and the MongoDB database that was created for you.

3. `npm install && npm run dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URL` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URL` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/3.x/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
