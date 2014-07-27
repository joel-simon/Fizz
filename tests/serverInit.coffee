async     = require('async')
db     = require('../app/server/adapters/db.js')
async.series [
  # (cb) -> db.query "drop table users, events, messages, new_friends, invites", cb
  (cb) -> db.query "drop schema public cascade;create schema public", cb
  (cb) -> db.query "create type platform as enum ('ios', 'android', 'sms')", cb
  (cb) -> db.query "create type latlng as (lat double precision, lng double precision)", cb
  (cb) -> db.query "CREATE TABLE users (
            uid serial NOT NULL,
            pn character(12) NOT NULL,
            name character varying(20) NOT NULL,
            password text NOT NULL,
            verified boolean DEFAULT false,
            last_login bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
            token text NOT NULL DEFAULT ''::text,
            last_location latlng,
            last_location_update bigint,
            platform platform NOT NULL DEFAULT 'sms',
            CONSTRAINT users_pkey PRIMARY KEY (uid),
            CONSTRAINT users_pn_key UNIQUE (pn) )", cb
  (cb) -> db.query "CREATE TABLE new_friends (
            uid integer NOT NULL,
            friend integer NOT NULL,
            time bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
            CONSTRAINT new_friends_pkey PRIMARY KEY (uid, friend),
            CONSTRAINT new_friends_friend_fkey FOREIGN KEY (friend)
                REFERENCES users (uid) MATCH SIMPLE
                ON UPDATE NO ACTION ON DELETE NO ACTION,
            CONSTRAINT new_friends_uid_fkey FOREIGN KEY (uid)
                REFERENCES users (uid) MATCH SIMPLE
                ON UPDATE NO ACTION ON DELETE NO ACTION )", cb
  (cb) -> db.query "CREATE TABLE events (
            eid serial NOT NULL,
            creator integer NOT NULL,
            description text,
            creation_time bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
            last_cluster_update bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
            clusters integer[],
            last_accepted_update bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
            death_time bigint,
            CONSTRAINT events_pkey PRIMARY KEY (eid),
            CONSTRAINT events_creator_fkey FOREIGN KEY (creator)
                REFERENCES users (uid) MATCH SIMPLE
                ON UPDATE NO ACTION ON DELETE NO ACTION )", cb
  (cb) -> db.query "CREATE TABLE messages (
            mid integer NOT NULL,
            eid integer NOT NULL,
            uid integer NOT NULL,
            data text,
            marker latlng,
            creation_time bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
            CONSTRAINT messages_pkey PRIMARY KEY (eid, mid),
            CONSTRAINT messages_eid_fkey FOREIGN KEY (eid)
                REFERENCES events (eid) MATCH SIMPLE
                ON UPDATE NO ACTION ON DELETE NO ACTION,
            CONSTRAINT messages_uid_fkey FOREIGN KEY (uid)
                REFERENCES users (uid) MATCH SIMPLE
                ON UPDATE NO ACTION ON DELETE NO ACTION,
            CONSTRAINT valid_message CHECK (data IS NOT NULL AND marker
              IS NULL OR data IS NULL AND marker IS NOT NULL) )", cb
  (cb) -> db.query "CREATE TABLE invites (
          eid integer NOT NULL,
          uid integer NOT NULL,
          confirmed boolean NOT NULL DEFAULT false,
          accepted boolean NOT NULL DEFAULT false,
          invited_time bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
          accepted_time bigint NOT NULL,
          inviter integer,
          CONSTRAINT invites_pkey PRIMARY KEY (eid, uid),
          CONSTRAINT my_fk FOREIGN KEY (inviter)
              REFERENCES users (uid) MATCH SIMPLE
              ON UPDATE NO ACTION ON DELETE NO ACTION,
          CONSTRAINT invite_logic CHECK (NOT (confirmed IS
            FALSE AND accepted IS TRUE)))", cb
], (err, results) ->
  if (err)
    console.log 'Error in init', err
    process.exit(1)
  else
    console.log 'DataBase has been initialized.'
    process.exit(0)