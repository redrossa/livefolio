CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "strategy" (
                            "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "strategy_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
                            "definition" jsonb,
                            "date_added" timestamp with time zone DEFAULT now(),
                            "link_id" varchar NOT NULL CONSTRAINT "strategy_link_id_key" UNIQUE,
                            "formatted_name" varchar GENERATED ALWAYS AS (
                                CASE
                                    WHEN (((definition ->> 'name'::text) IS NOT NULL) AND (length(TRIM(BOTH FROM (definition ->> 'name'::text))) > 0)) THEN (definition ->> 'name'::text)
                                    ELSE 'Untitled Strategy'::text
                                    END) STORED,
                            "latest_allocation_name" varchar
);
CREATE TABLE "subscription" (
                                "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
                                "email" varchar NOT NULL CONSTRAINT "subscription_email_key" UNIQUE,
                                "date_verified" timestamp with time zone,
                                "strategy_id" integer NOT NULL,
                                "verification_id" uuid DEFAULT gen_random_uuid() NOT NULL CONSTRAINT "subscription_verification_id_key" UNIQUE
);
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategy"("id");
CREATE UNIQUE INDEX "strategy_link_id_key" ON "strategy" ("link_id");
CREATE UNIQUE INDEX "strategy_pkey" ON "strategy" ("id");
CREATE UNIQUE INDEX "subscription_email_key" ON "subscription" ("email");
CREATE UNIQUE INDEX "subscription_pkey" ON "subscription" ("id");
CREATE UNIQUE INDEX "subscription_verification_id_key" ON "subscription" ("verification_id");