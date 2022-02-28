from audioop import cross
from functools import wraps
import json

from typing import Dict

from six.moves.urllib.request import urlopen

from flask import Flask, request, jsonify, _request_ctx_stack, Response
from flask_cors import CORS
from jose import jwt

from flask_pymongo import PyMongo

from bson.json_util import dumps, loads

from marshmallow import ValidationError
from models import WishSchema, UserSchema
from env import AUTH0_DOMAIN, API_IDENTIFIER, MONGO_URI

from uuid import uuid4

ALGORITHMS = ["RS256"]

app = Flask(__name__)

app.config[
    "MONGO_URI"
] = MONGO_URI
db = PyMongo(app).db

CORS(
    app,
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        "*",
    ],
)


@app.errorhandler(ValidationError)
def handle_exception(err):
    return {
        "status": "error",
        "data": str(err),
    }, 400


# Format error response and append status code.
class AuthError(Exception):
    """
    An AuthError is raised whenever the authentication failed.
    """
    def __init__(self, error: Dict[str, str], status_code: int):
        super().__init__()
        self.error = error
        self.status_code = status_code


@app.errorhandler(AuthError)
def handle_auth_error(ex: AuthError) -> Response:
    """
    serializes the given AuthError as json and sets the response status code accordingly.
    :param ex: an auth error
    :return: json serialized ex response
    """
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


def get_token_auth_header() -> str:
    """Obtains the access token from the Authorization Header
    """
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise AuthError({"code": "authorization_header_missing",
                         "description":
                             "Authorization header is expected"}, 401)

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise AuthError({"code": "invalid_header",
                        "description":
                            "Authorization header must start with"
                            " Bearer"}, 401)
    if len(parts) == 1:
        raise AuthError({"code": "invalid_header",
                        "description": "Token not found"}, 401)
    if len(parts) > 2:
        raise AuthError({"code": "invalid_header",
                         "description":
                             "Authorization header must be"
                             " Bearer token"}, 401)

    token = parts[1]
    return token


def requires_scope(required_scope: str) -> bool:
    """Determines if the required scope is present in the access token
    Args:
        required_scope (str): The scope required to access the resource
    """
    token = get_token_auth_header()
    unverified_claims = jwt.get_unverified_claims(token)
    if unverified_claims.get("scope"):
        token_scopes = unverified_claims["scope"].split()
        for token_scope in token_scopes:
            if token_scope == required_scope:
                return True
    return False


def requires_auth(func):
    """Determines if the access token is valid
    """
    
    @wraps(func)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        jsonurl = urlopen("https://" + AUTH0_DOMAIN + "/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())
        try:
            unverified_header = jwt.get_unverified_header(token)
        except jwt.JWTError as jwt_error:
            raise AuthError({"code": "invalid_header",
                            "description":
                                "Invalid header. "
                                "Use an RS256 signed JWT Access Token"}, 401) from jwt_error
        if unverified_header["alg"] == "HS256":
            raise AuthError({"code": "invalid_header",
                             "description":
                                 "Invalid header. "
                                 "Use an RS256 signed JWT Access Token"}, 401)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if rsa_key:
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=ALGORITHMS,
                    audience=API_IDENTIFIER,
                    issuer="https://" + AUTH0_DOMAIN + "/"
                )
            except jwt.ExpiredSignatureError as expired_sign_error:
                raise AuthError({"code": "token_expired",
                                "description": "token is expired"}, 401) from expired_sign_error
            except jwt.JWTClaimsError as jwt_claims_error:
                raise AuthError({"code": "invalid_claims",
                                "description":
                                    "incorrect claims,"
                                    " please check the audience and issuer"}, 401) from jwt_claims_error
            except Exception as exc:
                raise AuthError({"code": "invalid_header",
                                "description":
                                    "Unable to parse authentication"
                                    " token."}, 401) from exc

            _request_ctx_stack.top.current_user = payload
            
            return func(*args, **kwargs)
        raise AuthError({"code": "invalid_header",
                         "description": "Unable to find appropriate key"}, 401)

    return decorated


def get_email():
    return _request_ctx_stack.top.current_user["https://example.com/email"]


def only_set_given_fields(prefix, json):
    return {prefix + f".{key}": value for key, value in json.items()}


# Controllers API
@app.route("/api/users", methods=["GET"])
@requires_auth
def api_users():
    email = get_email()

    user = UserSchema(only=["_id"]).load({ "_id": email })
    user["wishes"] = []
    user["following"] = []
    db.users.update_one({ "_id": email }, { "$setOnInsert": user }, upsert=True)
    
    return {
        "status": "success",
        "data": loads(dumps(db.users.find_one({ "_id": email }))),
    }


@app.route("/api/users/<string:id>", methods=["GET"])
@requires_auth
def api_users_id(id):
    email = get_email()

    if id == email:
        return api_users()

    user = db.users.find_one({ "_id": email })

    if id in user["following"]:
        return {
            "status": "success",
            "data": loads(dumps(db.users.find_one({ "_id": id })))
        }

    return {
        "status": "error",
        "data": "Cannot access this resource",
    }, 401


@app.route("/api/wishes", methods=["POST"])
@requires_auth
def api_wishes():
    email = get_email()

    wish = WishSchema(only=["url"]).load(request.json)
    wish["id"] = uuid4().hex
    db.users.update_one({ "_id": email }, { "$push": { "wishes": wish } })
    
    return {
        "status": "success",
        "data": loads(dumps(db.users.find_one({ "_id": email }))),
    }


@app.route("/api/wishes/<string:id>", methods=["PUT", "DELETE"])
@requires_auth
def api_wishes_id(id):
    email = get_email()

    if request.method == "PUT":
        wish = WishSchema(only=["url"]).load(request.json)
        db.users.update_one({ "_id": email, "wishes.id": id }, { "$set": only_set_given_fields("wishes.$", wish) })

    if request.method == "DELETE":
        db.users.update_one({ "_id": email }, { "$pull": { "wishes": { "id": id } } })
    
    return {
        "status": "success",
        "data": loads(dumps(db.users.find_one({ "_id": email }))),
    }


# TODO: Only allow following valid users
@app.route("/api/following", methods=["POST"])
@requires_auth
def api_following():
    email = get_email()

    user = UserSchema(only=["_id"]).load(request.json)
    db.users.update_one({ "_id": email }, { "$push": { "following": user["_id"] } })
    
    return {
        "status": "success",
        "data": loads(dumps(db.users.find_one({ "_id": email }))),
    }


@app.route("/api/following/<string:id>", methods=["DELETE"])
@requires_auth
def api_following_id(id):
    email = get_email()

    db.users.update_one({ "_id": email }, { "$pull": { "following": id } })
    
    return {
        "status": "success",
        "data": loads(dumps(db.users.find_one({ "_id": email }))),
    }


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3010)

