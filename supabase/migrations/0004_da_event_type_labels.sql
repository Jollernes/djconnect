-- Danish labels for event types (IDs remain unchanged).
update public.event_types set label = 'Bryllup'           where id = 'wedding';
update public.event_types set label = 'Fødselsdagsfest'   where id = 'birthday';
update public.event_types set label = 'Firmaarrangement'  where id = 'corporate_event';
update public.event_types set label = 'Firmafest'         where id = 'corporate_party';
update public.event_types set label = 'Privatfest'        where id = 'private_party';
update public.event_types set label = 'Andet'             where id = 'other';
