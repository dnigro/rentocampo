begin;
do $$
declare owner_id uuid := gen_random_uuid(); field_id uuid; service_id uuid;
begin
 insert into auth.users(id,email,raw_user_meta_data)
 values(owner_id,'br-foundation-'||owner_id||'@example.invalid','{"country_code":"BR","tipo":"prestador","nombre":"UAT Brasil"}'::jsonb);
 if not exists(select 1 from public.profiles where id=owner_id and country_code='BR' and 'prestador'::public.user_role=any(roles)) then raise exception 'BR signup trigger failed'; end if;
 insert into public.campos(propietario_id,titulo,ubicacion,hectareas,country_code,provincia,moneda)
 values(owner_id,'UAT Brasil','Ribeirão Preto',100,'BR','São Paulo','BRL') returning id into field_id;
 insert into public.servicios_publicaciones(propietario_id,servicios_rurales,foto_url,provincia,country_code)
 values(owner_id,array['veterinaria'],'https://example.invalid/uat.jpg','São Paulo','BR') returning id into service_id;
 if not exists(select 1 from public.campos where id=field_id and country_code='BR' and moneda='BRL') then raise exception 'BR field failed'; end if;
 if not exists(select 1 from public.servicios_publicaciones where id=service_id and country_code='BR') then raise exception 'BR service failed'; end if;
 begin
  update public.campos set country_code='ZZ' where id=field_id;
  raise exception 'Unsupported country accepted';
 exception when check_violation then null;
 end;
end $$;
select 'PASS: BR profile trigger + role, field BRL, service, invalid-country rejection; fixtures rolled back' as result;
rollback;
