create type "public"."boarding_type" as enum ('on', 'off');

alter type "public"."policy_types" rename to "policy_types__old_version_to_be_dropped";

create type "public"."policy_types" as enum ('time_off', 'role_application', 'boarding');

create table "public"."boaring_check_list" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "checklist" jsonb[] not null,
    "org" text not null,
    "entity" bigint,
    "is_default" boolean not null,
    "type" boarding_type not null,
    "policy" bigint not null,
    "name" text not null,
    "description" text
);


alter table "public"."boaring_check_list" enable row level security;

alter table "public"."approval_policies" alter column type type "public"."policy_types" using type::text::"public"."policy_types";

drop type "public"."policy_types__old_version_to_be_dropped";

CREATE UNIQUE INDEX boaring_check_list_pkey ON public.boaring_check_list USING btree (id);

alter table "public"."boaring_check_list" add constraint "boaring_check_list_pkey" PRIMARY KEY using index "boaring_check_list_pkey";

alter table "public"."boaring_check_list" add constraint "boaring_check_list_entity_fkey" FOREIGN KEY (entity) REFERENCES legal_entities(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."boaring_check_list" validate constraint "boaring_check_list_entity_fkey";

alter table "public"."boaring_check_list" add constraint "boaring_check_list_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."boaring_check_list" validate constraint "boaring_check_list_org_fkey";

alter table "public"."boaring_check_list" add constraint "boaring_check_list_policy_fkey" FOREIGN KEY (policy) REFERENCES approval_policies(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."boaring_check_list" validate constraint "boaring_check_list_policy_fkey";

grant delete on table "public"."boaring_check_list" to "anon";

grant insert on table "public"."boaring_check_list" to "anon";

grant references on table "public"."boaring_check_list" to "anon";

grant select on table "public"."boaring_check_list" to "anon";

grant trigger on table "public"."boaring_check_list" to "anon";

grant truncate on table "public"."boaring_check_list" to "anon";

grant update on table "public"."boaring_check_list" to "anon";

grant delete on table "public"."boaring_check_list" to "authenticated";

grant insert on table "public"."boaring_check_list" to "authenticated";

grant references on table "public"."boaring_check_list" to "authenticated";

grant select on table "public"."boaring_check_list" to "authenticated";

grant trigger on table "public"."boaring_check_list" to "authenticated";

grant truncate on table "public"."boaring_check_list" to "authenticated";

grant update on table "public"."boaring_check_list" to "authenticated";

grant delete on table "public"."boaring_check_list" to "service_role";

grant insert on table "public"."boaring_check_list" to "service_role";

grant references on table "public"."boaring_check_list" to "service_role";

grant select on table "public"."boaring_check_list" to "service_role";

grant trigger on table "public"."boaring_check_list" to "service_role";

grant truncate on table "public"."boaring_check_list" to "service_role";

grant update on table "public"."boaring_check_list" to "service_role";

create policy "Enable all for auth users"
on "public"."boaring_check_list"
as permissive
for all
to authenticated
using (true);



