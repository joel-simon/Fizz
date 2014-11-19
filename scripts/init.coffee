async     = require('async')
db     = require('../app/server/adapters/db.js')
module.exports = (callback) ->
  async.series [
    (cb) -> db.query "drop schema public cascade;create schema public", cb
    (cb) -> db.query "create type platform as enum ('ios', 'android', 'sms')", cb
    (cb) -> db.query "create type latlng as (lat double precision, lng double precision)", cb
    (cb) -> db.query "CREATE TABLE users (
              uid serial primary KEY,
              pn character(12) NOT NULL,
              name character varying(20) NOT NULL,
              password character(6) NOT NULL,
              verified boolean DEFAULT false,
              \"lastLogin\" bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              \"phoneToken\" text NOT NULL DEFAULT ''::text,
              \"lastLocation\" latlng,
              \"lastLocationUpdate\" bigint,
              platform platform NOT NULL DEFAULT 'sms',
              CONSTRAINT users_pn_key UNIQUE (pn) )", cb

    (cb) -> db.query "CREATE TABLE events (
              eid serial primary KEY,
              creator integer NOT NULL,
              description text,
              key text,
              \"creationTime\" bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              \"lastClusterUpdate\" bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              clusters integer[],
              \"lastAcceptedUpdate\" bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
              \"deathTime\" bigint,
              CONSTRAINT events_creator_fkey FOREIGN KEY (creator)
                  REFERENCES users (uid) MATCH SIMPLE
                  ON UPDATE NO ACTION ON DELETE NO ACTION )", cb

    (cb) -> db.query "CREATE TABLE messages (
              mid serial primary KEY,
              eid integer NOT NULL,
              uid integer NOT NULL,
              text text,
              \"creationTime\" bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
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
            \"invitedTime\" bigint NOT NULL DEFAULT (extract(epoch from now())*1000)::bigint,
            \"acceptedTime\" bigint,
            inviter integer,
            CONSTRAINT invites_pkey PRIMARY KEY (eid, uid),
            CONSTRAINT my_fk FOREIGN KEY (inviter)
                REFERENCES users (uid) MATCH SIMPLE
                ON UPDATE NO ACTION ON DELETE NO ACTION,
            CONSTRAINT invite_logic CHECK (NOT (confirmed IS
              FALSE AND accepted IS TRUE)))", cb
    (cb) -> db.query "insert into users (uid, pn, name, password) values (0, '', 'server', '')", cb
  ], callback