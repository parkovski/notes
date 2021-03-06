var db = require('./db');

var makeSureTableExists = function(query) {
  db.query('CREATE TABLE IF NOT EXISTS '
    + query
    + ' ENGINE=InnoDB DEFAULT CHARSET=utf8;');
}

module.exports = function() {
  console.log('Checking if DB tables exist.');
  [
    'users (id serial PRIMARY KEY,'
      + ' name varchar(32) UNIQUE,'
      + ' password binary(20),'
      + ' email varchar(48) UNIQUE,'
      + ' theme tinyint DEFAULT 0,'
      + ' joindate TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    
    'orgs (id serial PRIMARY KEY,'
      + ' name varchar(128),'
      + ' description text,'
      + ' createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,'
      + ' lastmodifieddate TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
      + ' FULLTEXT INDEX name_ind (name))',

    'classes (id serial PRIMARY KEY,'
      + ' name varchar(128),'
      + ' description text,'
      + ' orgid bigint unsigned not null,'
      + ' createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,'
      + ' lastmodifieddate TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
      + ' INDEX orgid_ind (orgid),'
      + ' FULLTEXT INDEX name_ind (name),'
      + ' FOREIGN KEY (orgid) REFERENCES orgs(id) ON DELETE CASCADE)',

    'topic_tags (id serial PRIMARY KEY,'
      + ' name varchar(128) UNIQUE,'
      + ' description text)',

    'class_topic_assoc (classid bigint unsigned not null,'
      + ' tagid bigint unsigned not null,'
      + ' INDEX classid_ind (classid),'
      + ' FOREIGN KEY (classid) REFERENCES classes(id) ON DELETE CASCADE,'
      + ' FOREIGN KEY (tagid) REFERENCES topic_tags(id) ON DELETE CASCADE)',

    'note_pages (id serial PRIMARY KEY,'
      + ' classid bigint unsigned,'
      + ' name varchar(128),'
      + ' createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,'
      + ' lastmodifieddate TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
      + ' INDEX classid_ind (classid),'
      + ' FULLTEXT INDEX name_ind (name),'
      + ' FOREIGN KEY (classid) REFERENCES classes(id) ON DELETE SET NULL)',

    'user_class_membership (userid bigint unsigned not null,'
      + ' classid bigint unsigned not null,'
      + ' createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,'
      + ' INDEX userid_ind (userid),'
      + ' FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,'
      + ' FOREIGN KEY (classid) REFERENCES classes(id) ON DELETE CASCADE)',

    'user_org_membership (userid bigint unsigned not null,'
      + ' orgid bigint unsigned not null,'
      + ' createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,'
      + ' INDEX userid_ind (userid),'
      + ' FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,'
      + ' FOREIGN KEY (orgid) REFERENCES orgs(id) ON DELETE CASCADE)',

    'facebook_users (fbid bigint unsigned not null unique,'
      + ' userid bigint unsigned not null,'
      + ' INDEX userid_ind (userid),'
      + ' INDEX fbid_ind (fbid),'
      + ' FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE)',
    
    'google_users (googleid bigint unsigned not null unique,'
      + ' userid bigint unsigned not null,'
      + ' INDEX userid_ind (userid),'
      + ' INDEX googleid_ind (googleid),'
      + ' FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE)'
  ].map(makeSureTableExists);
};
