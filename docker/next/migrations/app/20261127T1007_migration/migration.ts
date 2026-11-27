#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/05be43daeee8fe06e168cd0f4f2f16c572cd116cce17e1ae49e5ae5da1a5a6b3/contract';
import startContract from '../../snapshots/05be43daeee8fe06e168cd0f4f2f16c572cd116cce17e1ae49e5ae5da1a5a6b3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b2f8946915cf2ed89378cb39c0594a507fba6baaf1328ff58e79c863024b740e/contract';
import endContract from '../../snapshots/b2f8946915cf2ed89378cb39c0594a507fba6baaf1328ff58e79c863024b740e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('sessionVersion', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
