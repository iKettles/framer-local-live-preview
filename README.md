# Framer Local Live Preview

A small server that provides the same functionality as Live Preview in [Framer Desktop](https://www.framer.com/) without requiring an internet connection or creating a tunnel between your machine and the cloud. This project covers 3 main use cases:

## Restricted networks

If you're running within a restricted/corporate network you may have issues using the live preview functionality that ships with Framer due to the nature of the implementation. This project mitigates that by running locally within the network and not serving any of your project's assets on an externally accessible URL.

## Prototyping with hardware

By providing a consistent URL for your prototype to be served on you can easily connect external hardware through the local network. You'll immediately see changes reflected on connected hardware as you make changes in Framer Desktop.

## Multi-screen prototypes

If you're building a multi-screen prototype with Framer, you've probably ran into the following issues:

- Framer doesn't serve your prototype on the network
- The port the preview runs on is unpredictable
- You need to make a web export of your project every time you make a change want to preview it on other hardware

This project simplifies that by implementing path-based routing using a consistent URL. You can run this server on a computer within your network or even on a Raspberry Pi, giving you a predictable URL you can use for any other devices that need to display your Framer prototype.

## Setup

This project consists of 2 parts:

- [Framer Local Live Preview Server](https://github.com/iKettles/framer-local-live-preview)
- [Framer Local Live Preview Package](https://packages.framer.com/package/iain/framer-local-live-preview)

You first start the live preview server:

`npx framer-local-live-preview`

Or install it globally if you don't want to use `npx`:

`yarn global add framer-local-live-preview`

`npm install framer-local-live-preview --global`

You then install the [package](https://packages.framer.com/package/iain/framer-local-live-preview) into your Framer project and follow the documentation on how to connect it to the server.

## Usage

Once you have the proxy server running and the component inserted into your project you're ready to start previewing. Every project needs to have a unique and URL friendly ID—we'll use this ID to route traffic to your prototype. Let's imagine I've given my project the ID `screen-1` and my proxy server is running at `http://localhost:8000`.

To access my project, I just need to go to the following URL in a web browser:
`http://localhost:8000/screen-1`

Every time I make a change in Framer Desktop it will be immediately reflected on the above URL. I can access it locally using the URL above and the component in my project will also tell me what my local IP is within the network, meaning any other device in my network can also access it. If you wanted your prototypes to be externally accessible on the network, you could even forward a port on your router to the proxy server.

## Best Practices

If you're going to be using this often it would be useful to have this server running 24/7 within the network and communicating its URL to your teammates. This means anyone who's working on a Framer project that needs live preview doesn't need to spin up their own server and is perfect for installations/demos.

## Roadmap

- Password authentication
- API/Proxy port configuration
