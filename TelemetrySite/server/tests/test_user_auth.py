import json

def test_user_auth_login(client):
    login_payload={
        
        "action":"login",
        "name":"test_user_valid3",
        "password":"123"
    }
    
    response = client.post(
        "/Login",
        json=login_payload
    )
    
    assert response.status_code == 200
    
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
        
    assert response.status_code == 200
    json_data = response.get_json()
    
    assert json_data!=None
    assert "auth_token" in json_data
    assert json_data["auth_token"] != None
    
    
    