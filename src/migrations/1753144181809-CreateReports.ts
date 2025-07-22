import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReports1753144181809 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para tipos de reporte
    await queryRunner.query(`
      CREATE TYPE "report_type_enum" AS ENUM (
        'posible_traidor', 
        'asesinato'
      )
    `);

    // Crear enum para estados de reporte
    await queryRunner.query(`
      CREATE TYPE "report_state_enum" AS ENUM (
        'en_proceso', 
        'aprobado', 
        'rechazado'
      )
    `);

    // Crear tabla reports
    await queryRunner.query(`
      CREATE TABLE "reports" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "traidor_id" uuid NOT NULL,
        "type_report" "report_type_enum" NOT NULL,
        "description" text NOT NULL,
        "file_url" varchar NOT NULL,
        "state" "report_state_enum" NOT NULL DEFAULT 'en_proceso',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "FK_reports_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_traidor_id" FOREIGN KEY ("traidor_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Crear índices para mejorar performance
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_user_id" ON "reports" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_traidor_id" ON "reports" ("traidor_id")  
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_state" ON "reports" ("state")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_type_report" ON "reports" ("type_report")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX "IDX_reports_type_report"`);
    await queryRunner.query(`DROP INDEX "IDX_reports_state"`);
    await queryRunner.query(`DROP INDEX "IDX_reports_traidor_id"`);
    await queryRunner.query(`DROP INDEX "IDX_reports_user_id"`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE "reports"`);

    // Eliminar enums
    await queryRunner.query(`DROP TYPE "report_state_enum"`);
    await queryRunner.query(`DROP TYPE "report_type_enum"`);
  }
}
