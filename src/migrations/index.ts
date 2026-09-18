import * as migration_20260918_112751_initial from './20260918_112751_initial';

export const migrations = [
  {
    up: migration_20260918_112751_initial.up,
    down: migration_20260918_112751_initial.down,
    name: '20260918_112751_initial'
  },
];
