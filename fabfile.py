from ast import literal_eval
from contextlib import contextmanager
import os
import json
from fabric.api import local, run, env, lcd, settings, prefix


DEFAULT_BRANCH = 'master'


BASE_DIR = os.path.realpath(os.path.dirname(__file__))


def relative_path(*args):
    return os.path.join(BASE_DIR, *args)


def publish(message, version=None):
    with lcd(BASE_DIR):
        local("npm run build")
        if version is None:
            with open("package.json") as fp:
                version = json.loads(fp.read())["version"]
            version = [int(a) for a in version.split(".")]
            version[-1] += 1
            version = ".".join(str(v) for v in version)
        with open("bower.json") as fh:
            content = fh.read()
            data = json.loads(content)
        data['version'] = version
        with open("bower.json", "w") as fh:
            fh.write(json.dumps(data, indent=4))
        local("git add . --all")
        local("git commit -am '%s'" % message)
        local("npm version %s" % version)
        local("git push origin master --tags")
        local("npm publish")


