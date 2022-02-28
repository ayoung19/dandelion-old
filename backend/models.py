from marshmallow import Schema, fields


class WishSchema(Schema):
    _id = fields.String(required=True)
    url = fields.Url(required=True)


class UserSchema(Schema):
    _id = fields.Email(required=True)
    wishes = fields.List(fields.Nested(WishSchema), required=True)
    following = fields.List(fields.Email(), required=True)