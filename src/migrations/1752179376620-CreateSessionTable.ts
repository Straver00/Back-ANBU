import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSessionTable1752179376620 implements MigrationInterface {
  name = 'CreateSessionTable1752179376620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'session',
        columns: [
          {
            name: 'sid',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'sess',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'expire',
            type: 'timestamp',
            precision: 6,
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'session',
      new TableIndex({
        name: 'IDX_session_expire',
        columnNames: ['expire'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('session', 'IDX_session_expire');
    await queryRunner.dropTable('session');
  }
}
