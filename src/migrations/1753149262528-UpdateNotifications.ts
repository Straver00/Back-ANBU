import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
export class UpdateNotifications1753149262528 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar enum y columna type
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "notifications_type_enum"`);

    // 2. Crear nuevo enum
    await queryRunner.query(`
    CREATE TYPE "notifications_type_enum" AS ENUM (
      'mission_delayed',
      'mission_failed',
      'mission_bounty',
      'mission_join_request',
      'mission_updated',
      'mission_new_captain',
      'message',
      'info'
    )
  `);

    // 3. Agregar columna 'type' como NULLABLE primero
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enumName: 'notifications_type_enum',
        isNullable: true, // TEMPORALMENTE NULLABLE
      }),
    );

    // 4. Rellenar valores existentes con 'info'
    await queryRunner.query(`
    UPDATE "notifications"
    SET "type" = 'info'
    WHERE "type" IS NULL
  `);

    // 5. Establecer columna como NOT NULL
    await queryRunner.query(`
    ALTER TABLE "notifications"
    ALTER COLUMN "type" SET NOT NULL
  `);

    // 6. Agregar columna context_id
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
    // 1. Eliminar columna context_id
    await queryRunner.dropColumn('notifications', 'context_id');

    // 2. Eliminar columna type y tipo enum actual
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "notifications_type_enum"`);

    // 3. Restaurar enum anterior
    await queryRunner.query(`
    CREATE TYPE "notifications_type_enum" AS ENUM (
      'mission',
      'decision',
      'info'
    )
  `);

    // 4. Agregar columna type como nullable temporalmente
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enumName: 'notifications_type_enum',
        isNullable: true, // IMPORTANTE: nullable temporal
      }),
    );

    // 5. Rellenar registros existentes con valor por defecto
    await queryRunner.query(`
      UPDATE "notifications"
      SET "type" = 'info'
      WHERE "type" IS NULL
    `);

    // 6. Hacer la columna NOT NULL nuevamente
    await queryRunner.query(`
      ALTER TABLE "notifications"
        ALTER COLUMN "type" SET NOT NULL
    `);
  }
}
