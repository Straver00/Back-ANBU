import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
export class UpdateNotifications1753149262528 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar el enum actual (requiere eliminar dependencia temporalmente)
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "notifications_type_enum"`);

    // 2. Crear nuevo enum con más valores
    await queryRunner.query(`
      CREATE TYPE "notifications_type_enum" AS ENUM (
        'mission_delayed',
        'mission_failed',
        'mission_bounty',
        'mission_join_request',
        'message',
        'info'
      )
    `);

    // 3. Volver a crear columna type con nuevo enum
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enumName: 'notifications_type_enum',
        isNullable: false,
      }),
    );

    // 4. Agregar columna context_id
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'context_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir context_id
    await queryRunner.dropColumn('notifications', 'context_id');

    // Eliminar nuevo enum y restaurar el anterior
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "notifications_type_enum"`);

    await queryRunner.query(`
      CREATE TYPE "notifications_type_enum" AS ENUM (
        'mission',
        'decision',
        'info'
      )
    `);

    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enumName: 'notifications_type_enum',
        isNullable: false,
      }),
    );
  }
}
