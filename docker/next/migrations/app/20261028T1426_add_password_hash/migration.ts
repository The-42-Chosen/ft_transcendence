#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/05be43daeee8fe06e168cd0f4f2f16c572cd116cce17e1ae49e5ae5da1a5a6b3/contract';
import endContract from '../../snapshots/05be43daeee8fe06e168cd0f4f2f16c572cd116cce17e1ae49e5ae5da1a5a6b3/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/6bcce5c453799d12aab153e4d70e13a5cfbf0b8e3bd922d9a4b2f4db0bc5447d/contract';
import startContract from '../../snapshots/6bcce5c453799d12aab153e4d70e13a5cfbf0b8e3bd922d9a4b2f4db0bc5447d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('passwordHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
