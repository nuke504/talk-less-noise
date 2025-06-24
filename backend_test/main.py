from flask import Flask, redirect, request, session, url_for, abort
import msal
import requests
import os

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_secret_key")  # Use a fixed key for development

client_id = os.getenv("AZURE_CLIENT_ID")
client_secret = os.getenv("AZURE_CLIENT_SECRET")
tenant_id = os.getenv("AZURE_TENANT_ID")
apim_url = os.getenv("APIM_URL")
authority = f"https://login.microsoftonline.com/{tenant_id}"
redirect_uri = "http://localhost:5000/getAToken"
# Add Microsoft Graph scope for user profile
# graph_scope = ["User.Read", "User.Read.All", "User.ReadBasic.All"]
scope = [f"api://talk-less-noise-backend/access"]

graph_me_url = "https://graph.microsoft.com/v1.0/me"

def _build_msal_app(cache=None, authority=None):
    return msal.ConfidentialClientApplication(
        client_id,
        authority=authority or f"https://login.microsoftonline.com/{tenant_id}",
        client_credential=client_secret,
        token_cache=cache
    )

@app.route("/")
def index():
    # Generate the authorization URL for user sign-in
    msal_app = _build_msal_app()
    auth_url = msal_app.get_authorization_request_url(
        scopes=scope,
        redirect_uri=redirect_uri,
        state=None
    )
    return redirect(auth_url)

@app.route("/getAToken")
def get_token():
    if "code" not in request.args:
        return abort(400, description="Missing authorization code.")
    msal_app = _build_msal_app()
    result = msal_app.acquire_token_by_authorization_code(
        request.args["code"],
        scopes=scope,
        redirect_uri=redirect_uri
    )
    if "access_token" in result:
        print(result["access_token"])
        session["access_token"] = result["access_token"]
        return redirect(url_for(".call_api"))
    else:
        return f"Error acquiring token: {result.get('error_description', 'Unknown error')}"

@app.route("/display_info")
def display_info():
    access_token = session.get("access_token")
    if not access_token:
        return redirect(url_for("index"))
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    # Get current user info
    response = requests.get(graph_me_url, headers=headers)
    if response.status_code == 200:
        user_info = response.json()
        user_info_html = f"<h2>Microsoft Graph /me info</h2><pre>{user_info}</pre>"
    else:
        user_info_html = f"Failed to fetch user info: {response.status_code}<br>{response.text}"

    # List all users in tenant (requires User.ReadBasic.All or User.Read.All permission)
    graph_users_url = "https://graph.microsoft.com/v1.0/users"
    users_response = requests.get(graph_users_url, headers=headers)
    if users_response.status_code == 200:
        users = users_response.json().get("value", [])
        users_list_html = "<h3>All Users in Tenant:</h3><ul>"
        for user in users:
            display = user.get("displayName", user.get("userPrincipalName", user.get("id")))
            users_list_html += f"<li>{display}</li>"
        users_list_html += "</ul>"
    else:
        users_list_html = f"<br>Failed to fetch users: {users_response.status_code}<br>{users_response.text}"

    return user_info_html + users_list_html

@app.route("/call_api")
def call_api():
    access_token = session.get("access_token")
    if not access_token:
        return redirect(url_for("index"))
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Ocp-Apim-Subscription-Key": "026b8a9965524401820ff496b7d8ceb8",
        "x-client-name": "flask-testing"
    }
    params = [
        ("group_by_columns", "ageGroup"),
        ("group_by_columns", "area"),
    ]
    response = requests.get(apim_url, headers=headers, params=params)
    return f"Status: {response.status_code}<br>Body: {response.text}"

if __name__ == "__main__":
    app.run(debug=True)