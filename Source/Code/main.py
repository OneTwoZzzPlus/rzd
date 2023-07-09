import keyboard as kb
from time import sleep

kb.press("windows")

m = ['right', 'down', 'left', 'up']

while True:
    kb.send(m[0])
    sleep(1)
    kb.send(m[1])
    sleep(0.01)
    kb.send(m[1])
    sleep(1)
    kb.send(m[2])
    sleep(1)
    kb.send(m[3])
    sleep(0.01)
    kb.send(m[3])
    sleep(1)

