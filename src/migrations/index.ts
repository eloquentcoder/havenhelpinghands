import * as migration_20260918_112751_initial from './20260918_112751_initial';
import * as migration_20260920_153450_add_media_blocks_and_completed_at from './20260920_153450_add_media_blocks_and_completed_at';
import * as migration_20260920_161154_add_page_headers from './20260920_161154_add_page_headers';

export const migrations = [
  {
    up: migration_20260918_112751_initial.up,
    down: migration_20260918_112751_initial.down,
    name: '20260918_112751_initial',
  },
  {
    up: migration_20260920_153450_add_media_blocks_and_completed_at.up,
    down: migration_20260920_153450_add_media_blocks_and_completed_at.down,
    name: '20260920_153450_add_media_blocks_and_completed_at',
  },
  {
    up: migration_20260920_161154_add_page_headers.up,
    down: migration_20260920_161154_add_page_headers.down,
    name: '20260920_161154_add_page_headers'
  },
];
