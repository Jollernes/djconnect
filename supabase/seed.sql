-- Admin bootstrap: run AFTER the admin user has signed up via the regular flow.
-- Replace the email with the admin's email.

update public.profiles
set role = 'admin'
where email = 'j.ssl@outlook.com';
