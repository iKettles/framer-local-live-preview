#!/usr/bin/env node

import { start } from './server';

async function main() {
  try {
    await start();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
