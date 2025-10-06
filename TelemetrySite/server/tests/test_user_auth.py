from http_codes import HttpResponseType

def test_user_auth_login(client):
    login_payload={
        "action":"login",
        "name":"test_user_valid",
        "password":"123"
    }
    
    response = client.post(
        "/Login",
        json=login_payload
    )
    
    assert response.status_code == HttpResponseType.OK.value
    json_data = response.get_json()
    
    assert json_data!=None
    assert "auth_token" in json_data
    assert json_data["auth_token"] != None

def test_user_auth_invalid_username(client):
    login_payload={
        "action":"login",
        "name":"bad_username",
        "password":"123"
    }
    response = client.post(
        "/Login",
        json=login_payload
    )
    
    assert response.status_code==HttpResponseType.UNAUTHORIZED.value, "User logged in with bad username"

def test_user_auth_update_token(client):
    login_payload={
        "action":"login",
        "name":"outdated_user",
        "password":"123"
    }
    response = client.post(
        "/Login",
        json=login_payload
    )
    assert response.status_code==HttpResponseType.OK.value
    json_data = response.get_json()
    
    assert json_data!=None
    assert "auth_token" in json_data
    assert json_data["auth_token"] != None

def test_user_auth_invalid_password(client):
    login_payload={
        "action":"login",
        "name":"test_user_valid",
        "password":"well this ain't right"
    }
    response = client.post(
        "/Login",
        json=login_payload
    )
    
    assert response.status_code==HttpResponseType.UNAUTHORIZED.value, "User logged in with bad password"

def test_user_auth_signup(client):
    signup_payload={    
        "action":"signup",
        "name":"test_user_signup",
        "password":"123",
        "secureNum":"12345"
    }
        
    response = client.post(
        "/Login",
        json=signup_payload
    )
        
    assert response.status_code == HttpResponseType.CREATED.value
    json_data = response.get_json()
    
    assert json_data!=None
    assert "auth_token" in json_data
    assert json_data["auth_token"] != None
    
    auth_token=json_data["auth_token"]
    
    login_payload={
        "action":"login",
        "name":"test_user_signup",
        "password":"123"
    }
    
    response = client.post(
        "/Login",
        json=login_payload
    )
    
    assert response.status_code == HttpResponseType.OK.value
    assert "auth_token" in json_data
    assert json_data["auth_token"] == auth_token

def test_user_auth_invalid_challenge(client):
    invalid_signup={
        "action":"signup",
        "name":"test_user_signup_invalid",
        "password":"123",
        "secureNum":"not_right"
    }
    
    response = client.post(
        "/Login",
        json=invalid_signup
    )
    
    assert response.status_code==HttpResponseType.UNAUTHORIZED.value, "User created an acount without challenge number"

def test_user_auth_duplicate_name(client):
    invalid_signup={
        "action":"signup",
        "name":"duplicate_user",
        "password":"123",
        "secureNum":"12345"
    }
    
    response = client.post(
        "/Login",
        json=invalid_signup
    )
    
    assert response.status_code==HttpResponseType.UNAUTHORIZED.value, "User created an with a duplicate name"