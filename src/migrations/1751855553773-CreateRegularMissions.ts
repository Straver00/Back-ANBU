import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateRegularMissions1751855553773 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'regular_missions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'code_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'objective',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'captain_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'deadline',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['Baja', 'Media', 'Alta', 'Crítica'],
            default: "'Baja'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['En Proceso', 'Retraso', 'Fracaso', 'Completada'],
            default: "'En Proceso'",
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

    await queryRunner.createForeignKey(
      'regular_missions',
      new TableForeignKey({
        columnNames: ['captain_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('regular_missions');
  }
}
