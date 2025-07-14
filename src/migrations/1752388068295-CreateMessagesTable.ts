import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableCheck,
  TableIndex,
} from 'typeorm';

export class CreateMessagesTable1752388068295 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear la tabla
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'mission_id',
            type: 'uuid',
          },
          {
            name: 'message',
            type: 'varchar',
            length: '1000',
          },
          {
            name: 'isSystem',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    // 2. Agregar checks
    await queryRunner.createCheckConstraint(
      'messages',
      new TableCheck({
        name: 'CHK_message_user_relation_consistency',
        expression: `"isSystem" = true AND "user_id" IS NULL OR "isSystem" = false AND "user_id" IS NOT NULL`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'messages',
      new TableCheck({
        name: 'CHK_message_min_length',
        expression: `char_length("message") > 0`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'messages',
      new TableCheck({
        name: 'CHK_message_max_length',
        expression: `char_length("message") <= 1000`,
      }),
    );

    // 3. Índices
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_messages_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_messages_mission_id',
        columnNames: ['mission_id'],
      }),
    );

    // 4. Llaves foráneas
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['mission_id'],
        referencedTableName: 'regular_missions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messages');
  }
}
