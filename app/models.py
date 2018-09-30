
"""
All models for module
"""

from datetime import datetime
# from sqlalchemy.ext.hybrid import hybrid_property
from flask_login import UserMixin
# import humanize
from app import db, argon2


transactions = db.Table(
    'transactions',
    db.Column(
        'account_from_id',
        db.Integer,
        db.ForeignKey('account.id'),
        primary_key=True
    ),
    db.Column(
        'account_to_id',
        db.Integer,
        db.ForeignKey('acount.id'),
        primary_key=True
    ),
    db.Column(
        'ammount',
        db.DECIMAL,
    ),
    db.Column(
        'send_at',
        db.DateTime,
        default=datetime.utcnow
    )
)


class Transaction(db.Moddel):
    id = db.Column(db.Integer, primary_key=True)
    send_at = db.Column(db.DateTime, default=datetime.utcnow)

    send = db.relationship(
        'Account',
        secondary=transactions,
        lazy='subquery',
        backref=db.backref('received', lazy=True)
    )


class Account(db.Moddel):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    IBAN = db.Column(db.String(255), unique=True)

    send = db.relationship(
        'Account',
        secondary=transactions,
        lazy='subquery',
        backref=db.backref('received', lazy=True)
    )


class User(Account, UserMixin):
    email = db.Column(db.String(255), unique=True)
    firstname = db.Column(db.String(255))
    middlename = db.Column(db.String(255))
    lastname = db.Column(db.String(255))
    _password = db.Column("password", db.String(255))

    registration_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)

    def __init__(self, id=None):
        self.id = id

    @property
    def name(self):
        return "%s %s %s" % (self.firstname, self.middlename, self.lastname)

    @property
    def password(self):
        return self._password

    @password.setter
    def password(self, password):
        """Hash password"""
        self._password = argon2.generate_password_hash(password)

    def check_password(self, password):
        """Check if password is correct"""
        return argon2.check_password_hash(self.password, password)

    def __repr__(self):
        return "<User(%s)>" % (self.id)


class User(Account, UserMixin):
    email = db.Column(db.String(255), unique=True)
    firstname = db.Column(db.String(255))
    middlename = db.Column(db.String(255))
    lastname = db.Column(db.String(255))
    _password = db.Column("password", db.String(255))

    registration_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)

    def __init__(self, id=None):
        self.id = id

    @property
    def name(self):
        return "%s %s %s" % (self.firstname, self.middlename, self.lastname)

    @property
    def password(self):
        return self._password

    @password.setter
    def password(self, password):
        """Hash password"""
        self._password = argon2.generate_password_hash(password)

    def check_password(self, password):
        """Check if password is correct"""
        return argon2.check_password_hash(self.password, password)

    def __repr__(self):
        return "<User(%s)>" % (self.id)
