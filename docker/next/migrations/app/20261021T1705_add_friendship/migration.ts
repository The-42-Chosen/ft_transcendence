#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/676344075a449215be84a4aa4c9105b7ded31d0f1f1c868d903e19eaac12999c/contract';
import startContract from '../../snapshots/676344075a449215be84a4aa4c9105b7ded31d0f1f1c868d903e19eaac12999c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/751ab32b027651fd3603be8adbeb73cf25ff1b767591b71786f3599f03219546/contract';
import endContract from '../../snapshots/751ab32b027651fd3603be8adbeb73cf25ff1b767591b71786f3599f03219546/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Friendship',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('friendId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Friendship',
        constraint: 'Friendship_userId_friendId_key',
        columns: ['userId', 'friendId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Friendship',
        index: 'Friendship_friendId_idx_7ad40ec8',
        columns: ['friendId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Friendship',
        index: 'Friendship_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Friendship',
        foreignKey: {
          name: 'Friendship_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Friendship',
        foreignKey: {
          name: 'Friendship_friendId_fkey',
          columns: ['friendId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
