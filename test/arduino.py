#! /usr/bin/python

solenoid = False
relay = False

print 'running'

while True:
	command = raw_input()
	if command == 'd':
		print('a:50;l:25')
	elif command == 's':
		if solenoid:
			print('solenoidOff')
			solenoid = False
		else:
			print('solenoidOn')
			solenoid = True
	elif command == 'r':
		if relay:
			print('relayOff')
			relay = False
		else:
			print('relayOn')
			relay = True
