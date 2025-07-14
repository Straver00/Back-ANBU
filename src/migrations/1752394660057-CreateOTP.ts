import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateOTP1752394660057 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'otps',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'otp_code',
            type: 'varchar',
            length: '6',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['login', 'password_reset'],
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'is_used',
            type: 'boolean',
            default: false,
          },
          {
            name: 'used_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
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
        ],
      }),
    );

    // Crear índice para optimizar consultas
    await queryRunner.createIndex(
      'otps',
      new TableIndex({
        name: 'IDX_otps_email_type_used',
        columnNames: ['email', 'type', 'is_used'],
      }),
    );

    // Foreign key para user_id (opcional)
    await queryRunner.createForeignKey(
      'otps',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('otps');
  }
}
