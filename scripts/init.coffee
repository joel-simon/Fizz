async     = require('async')
db     = require('../app/server/adapters/db.js')
module.exports = (callback) ->
  async.series [
    # (cb) -> db.query "drop table users, events, messages, new_friends, invites", cb
    (cb) -> db.query "drop schema public cascade;create schema public", cb
    (cb) -> db.query "create type platform as enum ('ios', 'android', 'sms')", cb
    (cb) -> db.query "create type latlng as (lat double precision, lng double precision)", cb
    (cb) -> db.query "CREATE TABLE users (
              uid serial primary KEY,
              pn character(12) NOT NULL,
              name character varying(20) NOT NULL,
              password character(6) NOT NULL,
              verified boolean DEFAULT false,
              lastLogin bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              phone_token text NOT NULL DEFAULT ''::text,
              last_location latlng,
              last_location_update bigint,
              platform platform NOT NULL DEFAULT 'sms',
              CONSTRAINT users_pn_key UNIQUE (pn) )", cb

    (cb) -> db.query "CREATE TABLE events (
              eid serial primary KEY,
              creator integer NOT NULL,
              description text,
              key text,
              creation_time bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              last_cluster_update bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              clusters integer[],
              last_accepted_update bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              death_time bigint default 0,
              CONSTRAINT events_creator_fkey FOREIGN KEY (creator)
                  REFERENCES users (uid) MATCH SIMPLE
                  ON UPDATE NO ACTION ON DELETE NO ACTION )", cb

    (cb) -> db.query "CREATE TABLE messages (
              mid serial primary KEY,
              eid integer NOT NULL,
              uid integer NOT NULL,
              text text,
              creation_time bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              CONSTRAINT messages_eid_fkey FOREIGN KEY (eid)
                  REFERENCES events (eid) MATCH SIMPLE
                  ON UPDATE NO ACTION ON DELETE NO ACTION,
              CONSTRAINT messages_uid_fkey FOREIGN KEY (uid)
                  REFERENCES users (uid) MATCH SIMPLE
                  ON UPDATE NO ACTION ON DELETE NO ACTION )", cb

    (cb) -> db.query "CREATE TABLE invites (
            eid integer NOT NULL,
            uid integer NOT NULL,
            confirmed boolean NOT NULL DEFAULT true,
            accepted boolean NOT NULL DEFAULT false,
            key text NOT NULL,
            invited_time bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
            accepted_time bigint,
            inviter integer,
            CONSTRAINT invites_pkey PRIMARY KEY (eid, uid),
            CONSTRAINT my_fk FOREIGN KEY (inviter)
                REFERENCES users (uid) MATCH SIMPLE
                ON UPDATE NO ACTION ON DELETE NO ACTION,
            CONSTRAINT invite_logic CHECK (NOT (confirmed IS
              FALSE AND accepted IS TRUE)))", cb
  ], callback