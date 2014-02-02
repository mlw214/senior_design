#! /usr/bin/python
import sys
solenoid = False
relay = False

while True:
	command = raw_input()
	if command == 'd':
		sys.stdout.write('a:50;l:25\n')
		sys.stdout.flush()
	elif command == 's':
		if solenoid:
			sys.stdout.write('solenoidOff\n')
			solenoid = False
		else:
			sys.stdout.write('solenoidOn\n')
			solenoid = True
		sys.stdout.flush()
	elif command == 'r':
		if relay:
			sys.stdout.write('relayOff\n')
			relay = False
		else:
			sys.stdout.write('relayOn\n')
			relay = True
		sys.stdout.flush()
