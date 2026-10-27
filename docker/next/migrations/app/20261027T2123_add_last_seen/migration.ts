#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6bcce5c453799d12aab153e4d70e13a5cfbf0b8e3bd922d9a4b2f4db0bc5447d/contract';
import endContract from '../../snapshots/6bcce5c453799d12aab153e4d70e13a5cfbf0b8e3bd922d9a4b2f4db0bc5447d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/751ab32b027651fd3603be8adbeb73cf25ff1b767591b71786f3599f03219546/contract';
import startContract from '../../snapshots/751ab32b027651fd3603be8adbeb73cf25ff1b767591b71786f3599f03219546/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('lastSeen', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
