import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1689064612442 implements MigrationInterface {
  name = 'Init1689064612442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_table_status_enum" AS ENUM('online', 'offline', 'away', 'do-not-disturb')`
    );
    await queryRunner.query(
      `CREATE TABLE "users_table" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(32) NOT NULL, "lastLoggedIn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."users_table_status_enum" NOT NULL DEFAULT 'offline', "createdAccountAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c50d83972fb8fa9d6cddcae7201" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "loginfo_table" ("user_id" character varying NOT NULL, "password" character varying(64) NOT NULL, "email" character varying(64) NOT NULL, CONSTRAINT "PK_397353dd80a415dab9468f463cb" PRIMARY KEY ("user_id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "loginfo_table"`);
    await queryRunner.query(`DROP TABLE "users_table"`);
    await queryRunner.query(`DROP TYPE "public"."users_table_status_enum"`);
  }
}
