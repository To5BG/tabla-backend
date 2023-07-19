import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1689793544044 implements MigrationInterface {
    name = 'Init1689793544044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_table_status_enum" AS ENUM('online', 'offline', 'away', 'do-not-disturb')`);
        await queryRunner.query(`CREATE TABLE "users_table" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(32) NOT NULL, "lastLoggedIn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."users_table_status_enum" NOT NULL DEFAULT 'offline', "createdAccountAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b02a47aeb5bfd6728e8eae9c143" UNIQUE ("username"), CONSTRAINT "PK_c50d83972fb8fa9d6cddcae7201" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "credentials_table" ("user_id" character varying NOT NULL, "version" integer NOT NULL DEFAULT '0', "password" character varying(64) NOT NULL, "lastPassword" character varying(64) NOT NULL DEFAULT '', "passwordUpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(64) NOT NULL, CONSTRAINT "UQ_506bd4b831f11620a52a19d95ae" UNIQUE ("email"), CONSTRAINT "PK_e71a50ba58a451fd740667f55d6" PRIMARY KEY ("user_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "credentials_table"`);
        await queryRunner.query(`DROP TABLE "users_table"`);
        await queryRunner.query(`DROP TYPE "public"."users_table_status_enum"`);
    }

}
