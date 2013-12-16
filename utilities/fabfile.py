from __future__ import with_statement
from fabric.api import *
from fabric.contrib.console import confirm

env.hosts = ['204.236.234.28']
env.user = 'ec2-user'
env.key_filename = '/home/ec2-user/transistor.pem'

beacon_dir = '/var/www/html/Beacon'

def hello(name="world"):
    print("Hello %s!" % name)


def local_uname():
    local('uname -a')

def remote_uname():
    run('uname -a')

def deploy():
	with cd(beacon_dir):
		remote("git pull")
		remote("forever restartall")
		# run('touch %sfoo.txt' % beacon_dir)