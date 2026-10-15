-- Run only in isolated UAT after the regional migration; fixtures are rolled back.
begin;
do $$
declare c text; r text; uid uuid; actual public.profiles%rowtype;
begin
  foreach c in array array['AR','UY','PY'] loop
    foreach r in array array['productor','propietario','prestador'] loop
      uid := gen_random_uuid();
      insert into auth.users(id, email, raw_user_meta_data)
        values(uid, 'uat-role-'||uid||'@example.invalid', jsonb_build_object('nombre','Fixture temporal','tipo',r,'country_code',c));
      select * into actual from public.profiles where id=uid;
      if actual.country_code is distinct from c or actual.roles::text[] is distinct from array[r] then
        raise exception 'Regional signup regression: country %, role %', c, r;
      end if;
    end loop;
  end loop;
end;
$$;
rollback;
