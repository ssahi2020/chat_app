from flask import Flask, render_template, request, jsonify, session, abort
from functools import wraps
from collections import defaultdict
import mysql.connector, bcrypt, configparser, io, re


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

config = configparser.ConfigParser()
config.read('secrets.cfg')
PEPPER = config['secrets']['PEPPER']
DB_NAME = 'ssahi'
DB_USERNAME = config['secrets']['DB_USERNAME']
DB_PASSWORD = config['secrets']['DB_PASSWORD']
app.secret_key = PEPPER #to encrypt session stuff

@app.route('/')
def index():
    print(PEPPER)
    return app.send_static_file('index.html')

# -------------------------------- API ROUTES ----------------------------------

@app.route('/api/signup', methods=['POST'])
def signup ():
    #1. Get request body    
    print(request.data)
    body = request.get_json() # {'username':'saumit', 'email':''}
    print(body)

    username = body['username']

    #2. Validate email
    regex = r'^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$'
    email = body['email']
    if not re.match(regex, email):
        return {"username" : username}, 302

    #3. Check password == password_confirm
    password, confirmation = body['password'], body['confirmation']
    if password != confirmation:
        return {"username" : username}, 302
    del body['confirmation']

    #4. salt and pepper password
    password = password + PEPPER
    salt = bcrypt.gensalt()
    body['password'] = bcrypt.hashpw(password.encode('utf-8'), salt)

    #5. Create Array of input columns containing all keys from req body that 
    #   have non-null corresponding values
    input_columns = []
    input_values = []

    #6. input_values = body[key] for key in input_columns
    for key in body.keys():
        if body[key]:
            input_columns.append(key)
            input_values.append(body[key])

    #7. Create insert query

    input_columns_as_string = ','.join(input_columns)
    num_input_columns = len(input_columns)

    query = 'INSERT INTO users(%s) '%input_columns_as_string
    query += 'VALUES(' + ','.join(['%s']*num_input_columns) + ');'
    #8. connect to database
    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD, port='3306')
    cursor = connection.cursor()
    print(query)
    #9. send and commit query to database
    try:
        print('hi')
        cursor.execute(query,tuple(input_values))        
        connection.commit()
        print('success!')

        cursor.execute('SELECT username, first_name, last_name, email, user_id FROM users WHERE username=%s',(username,))
        print('still good!')
        x = {} 
        for result in cursor.fetchall():
            x['username'] = result[0]
            x['first_name'] = result[1]
            x['last_name'] = result[2]
            x['email'] = result[3]
            x['user_id'] = result[4]
        print(x)

        return x
    except Exception as e:
        print(e)
        return {}, 302
    finally:
        cursor.close()
        connection.close()


@app.route('/api/login', methods=['POST'])
def login (): 
    
    session.clear() #get rid of session cookie at beginning of login

    print(request.data)
    body = request.get_json()
    print(body)

    username = body['username']
    password = body['password'] + PEPPER

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    query = "SELECT password FROM users WHERE username=%s"

    try:
        cursor.execute(query, (username,))
        hashed = cursor.fetchone()[0]
        print(hashed)
        success = bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        print(success)

        if success:
            cursor.execute('SELECT username, first_name, last_name, email, user_id FROM users WHERE username=%s',(username,))
            x = {} 
            for result in cursor.fetchall():
                x['username'] = result[0]
                session['username'] = result[0]
                x['first_name'] = result[1]
                x['last_name'] = result[2]
                x['email'] = result[3]
                x['user_id'] = result[4]
                session['user_id'] = result[4]
            print(x)
            return x
        
        abort(403)
    except Exception as e:
        print(e)
        return {}, 404
    finally:
        cursor.close()
        connection.close()

@app.route('/api/users/logout', methods=['GET'])
def logout():
    print('logging out')
    session.clear() #delete session cookie

    return {}

@app.route('/api/password_reset_email', methods=['POST'])
def password_reset_email():
    # get email from post request
    # to send an email with sendgrid api
    pass

# @app.route('/api/users/<username>', methods=['GET'])
# def user_details(username):
#     #show username details
#     pass

@app.route('/api/users/count_unread', methods=['GET'])
def count_unread():
    print(request.data)
    body = request.get_json() # {'username':'saumit', 'email':''}
    print(body) 
    #1. get username from session data 
    
    username = body['username']

    #2. run sql queries to count unread messages

    query = ('SELECT c.channel_id, c.name AS channel_name, COUNT(*) AS count'
            'FROM messages m'
                'INNER JOIN channels c ON m.channel_id = c.channel_id'
                'LEFT JOIN (SELECT * FROM message_views WHERE viewer_id = %s) mv'
                    'ON m.message_id = mv.message_id'
            'WHERE mv.view is NULL'
            'GROUP BY c.channel_id, c.name')

    pass

@app.route('/api/users/update', methods=['POST'])
def update_user():
    #1. get username from session data
    print(request.data)
    body = request.get_json()
    print(body)

    username = body['username']

    input_columns = []
    input_values = []

    for key in body.keys():
        if body[key]:
            input_columns.append(key)
            input_values.append(key)
    

    #2. allow them to update email and display name
    pass

# @app.route('/api/users/softdelete', methods=['POST'])
# def softdelete_user():
#     #1. update deleted_at in user table 
#     pass

@app.route('/api/change_password/<token>', methods=['POST'])
def change_password():
    #1. 
    pass

# @app.route('/api/users/harddelete', methods=['POST'])
# def harddelete_user():
#     #1. 
#     pass

#channels
@app.route('/api/channels/create', methods=['POST'])
def channel_create():
    body = request.get_json()
    name = body['name']
    username = body['user_id'] 

    #insert into channels table
    #also need to lookup user_id and join to channel
    query = ('INSERT INTO channels(name, creator_id)'
        'VALUES(%s, %s)')

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    try:
        cursor.execute(query,(name,username))
        connection.commit()

        return {}
    except Exception as e:
        print(e)
        return {}, 404
    finally:
        cursor.close()
        connection.close()

@app.route('/api/channels/view', methods=['POST'])
def channel_list():
    body = request.get_json()
    user_id = body['user_id']

    query = ('SELECT c.name, (SELECT COUNT(*) FROM messages WHERE '
            'channel_id=uc.channel_id AND replies_to IS NULL AND message_id > IFNULL(uc.last_message_id, 0)) AS unread_messages '
            'FROM user_channel uc INNER JOIN channels c ON uc.channel_id = c.channel_id '
            'WHERE uc.user_id = %s AND c.deleted_at IS NULL')

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    try:
        cursor.execute(query,(user_id,))

        parsed = []
        for result in cursor.fetchall():
            print(result)
            x = {}
            x['name'] = result[0]
            x['unread_messages'] = result[1]
            parsed.append(x) 

        print(parsed)
        return jsonify(parsed)

    except Exception as e:
        print(e)
        return {}, 404
    finally:
        cursor.close()
        connection.close()    

@app.route('/api/channels/read/', methods=['POST'])
def channel_read():
    #1. query channel tables, join with messages
    body = request.get_json()
    name = body['name']
    user_id = body['user_id']

    query = ('SELECT m.body, m.message_id, u.username, m.poster_id FROM messages m '
            'INNER JOIN (SELECT * FROM channels WHERE name= %s) c '
            'ON m.channel_id = c.channel_id '
            'LEFT JOIN (SELECT * FROM users WHERE deleted_at is NULL) u '
            'ON m.poster_id = u.user_id '
            'WHERE m.replies_to is NULL '
            'ORDER BY m.message_id ASC ')

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()
    
    update = ('UPDATE user_channel '
            'SET last_message_id = %s '
            'WHERE user_id = %s AND '
            'channel_id = (SELECT channel_id FROM channels WHERE name = %s)')

    try:
        cursor.execute(query,(name,))
        # print(cursor.fetchall())

        parsed = []
        last_id = 0
        for result in cursor.fetchall():
            x = {}
            x['body'] = result[0]
            x['message_id']= result[1]
            last_id = result[1]
            x['username']=result[2]
            x['user_id']=result[3]
            parsed.append(x)
        # print(parsed)

        if parsed:
            # print('im about to update user_channel')
            cursor.execute(update,(last_id, user_id, name))
            connection.commit()
            # print('i was successful')

        return jsonify(parsed)
    except Exception as e:
        print(e)
        return {'name' : name}, 404
    finally:
        cursor.close()
        connection.close()

@app.route('/api/channels/delete', methods=['POST'])
def channel_delete():
    #1. confirm user is owner of channel
    print(request.data)
    body = request.get_json()
    print(body)

    user_id = body['user_id']
    name = body['name'] #channel name

    query = ("UPDATE channels SET deleted_at = (SELECT NOW()) "
            "WHERE name = %s AND creator_id = %s")
    
    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    try:
        cursor.execute(query, (name, user_id))
        connection.commit()
        return {}
    except Exception as e:
        print(e)
        return {"username" : username,
                "body" : body}, 404
    finally:
        cursor.close()
        connection.close()

    pass

#messages
@app.route('/api/messages/post', methods=['POST'])
def message_post():
    #1. get channel username
    print(request.data)
    body = request.get_json()
    print(body)

    name = body['name']
    username = body['username']
    text = body['text']

    #2. query insert into
    query = ('INSERT INTO messages (channel_id, poster_id, body) '
            'VALUES ((SELECT channel_id FROM channels WHERE name = %s), '
            '(SELECT user_id FROM users WHERE username = %s) , %s)')

    #3. connect and execute
    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    try:
        print(query)
        cursor.execute(query, (name, username, text))
        connection.commit()
        return {}
    except Exception as e:
        print(e)
        return {"username" : username,
                "text" : text}, 404
    finally:
        cursor.close()
        connection.close()

    pass

@app.route('/api/messages/read/', methods=['POST'])
def message_read():
    #1. NEED TO get message_id and message_id, 
    # PROBLEM IF MESSAGE TEXT IS THE SAME THO
    print(request.data)
    body = request.get_json()
    print(body)

    name = body['name']
    username = body['username']

    #2. update message_views
    pass

# @app.route('/api/messages/delete', methods=['POST'])
# def message_delete():
#     pass

# #threads
# @app.route('/api/threads/create', methods=['POST'])
# def thread_create():
#     pass

# @app.route('/api/threads/adduser', methods=['POST'])
# def thread_adduser():
#     pass

@app.route('/api/threads/read', methods=['POST'])
def thread_read():

    body = request.get_json()
    msg_id = body['msg_id']


    query = ('SELECT m.body, u.username FROM messages m '
            'LEFT JOIN (SELECT * FROM users WHERE deleted_at is NULL) u '
            'ON m.poster_id = u.user_id '
            'WHERE m.replies_to = %s '
            'ORDER BY m.message_id ASC ')

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()
    
    try:
        cursor.execute(query,(msg_id,))

        parsed = []
        for result in cursor.fetchall():
            x = {}
            x['body'] = result[0]
            x['username']=result[1]
            parsed.append(x)
        print(parsed)

        return jsonify(parsed)
    except Exception as e:
        print(e)
        return {'name' : name}, 404
    finally:
        cursor.close()
        connection.close()

    pass

@app.route('/api/threads/post', methods=['POST'])
def thread_add():
    #1. get channel username
    print(request.data)
    body = request.get_json()
    print(body)

    name = body['name'] #channel name
    thread_id = body['msg_id']
    user_id = body['user_id']
    message = body['message']

    #2. query insert into
    query = ('INSERT INTO messages (channel_id, body, poster_id, replies_to) '
            'VALUES ((SELECT channel_id FROM channels WHERE name=%s), %s, %s, %s)')

    #3. connect and execute
    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    try:
        print(query)
        cursor.execute(query, (name, message, user_id, thread_id))
        connection.commit()
        return {}
    except Exception as e:
        print(e)
        return {"name" : name,
                "text" : text}, 404
    finally:
        cursor.close()
        connection.close()

    pass

# @app.route('/api/thread/delete', methods=['POST'])
# def thread_delete():
#     pass

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
