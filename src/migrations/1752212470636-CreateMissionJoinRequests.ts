import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateMissionJoinRequests1752212470636
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mission_join_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'mission_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'agent_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'request_by',
            type: 'enum',
            enum: ['captain', 'agent'],
            isNullable: false,
          },
          {
            name: 'is_reinforcement',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pendiente', 'aceptada', 'rechazada'],
            default: "'pendiente'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
    );

    // Foreign key para mission_id
    await queryRunner.createForeignKey(
      'mission_join_requests',
      new TableForeignKey({
        columnNames: ['mission_id'],
        referencedTableName: 'regular_missions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Foreign key para agent_id
    await queryRunner.createForeignKey(
      'mission_join_requests',
      new TableForeignKey({
        columnNames: ['agent_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mission_join_requests');
  }
}
