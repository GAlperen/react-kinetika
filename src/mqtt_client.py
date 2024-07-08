import time
import random
import json
import paho.mqtt.client as paho

def on_connect(client, userdata, flags, rc, properties=None):
    print("CONNACK received with code %s." % rc)

def on_publish(client, userdata, mid, properties=None):
    print("mid: " + str(mid))

def on_subscribe(client, userdata, mid, granted_qos, properties=None):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

def on_message(client, userdata, msg):
    konu = msg.topic
    bilgi = msg.payload.decode('utf-8')
    print(f"Konu: {konu}, Bilgi: {bilgi}")

client = paho.Client(client_id="", userdata=None, protocol=paho.MQTTv5)
client.on_connect = on_connect
client.tls_set(tls_version=paho.ssl.PROTOCOL_TLS)
client.username_pw_set("bugraozcan", "bugra123")
client.connect("eb9d3f26886e4180adf738f3425f8e19.s1.eu.hivemq.cloud", 8883)
client.on_subscribe = on_subscribe
client.on_message = on_message
client.on_publish = on_publish
client.subscribe("encyclopedia/#", qos=1)
client.loop_start()

total_runtime = 60
start_time = time.time()
interval = 2.5
min_x, max_x = -16000 , 0
min_y, max_y = 0, 12500

# Initial battery level
battery_level = 100

while time.time() - start_time < total_runtime:
    if int(time.time() * 10) % int(interval * 10) == 0:
        weight = [0, 25, 50, 75][random.randint(0, 3)]
        battery_level = max(battery_level - 0.5, 0)
        robot_state = {
            "Battery_Status": battery_level,
            "Speed": round(random.random() * 10, 2),
            "Current": round(20 - random.random() * 0.03, 2),
            "Carried_Weight": weight,
            "Barrier_Information": random.random() > 0.9,
            "Temperature": round(27 + random.random() * 20, 2),
            "Dangerous_Gas_Quantity": random.random() > 0.95,
            "Weight_Lifting_Status": weight != 0,
            "Location": (random.randint(min_x, max_x), random.randint(min_y, max_y))
        }
        json_data = json.dumps(robot_state)
        client.publish("encyclopedia/robot_state", payload=json_data.encode('utf-8'), qos=1)
    time.sleep(0.1)

client.loop_stop()
